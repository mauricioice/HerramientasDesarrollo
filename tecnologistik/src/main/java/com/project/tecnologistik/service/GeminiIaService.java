package com.project.tecnologistik.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.tecnologistik.dto.AnalizarTicketRequest;
import com.project.tecnologistik.dto.AnalizarTicketResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GeminiIaService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public AnalizarTicketResponse analizarTicket(AnalizarTicketRequest request) {
        try {
            String prompt = """
                Eres un asistente IA para un sistema de tickets.

                Analiza el ticket del cliente y responde SOLO JSON válido.

                Reglas:
                - Si es problema técnico: areaDestino = TECNICO.
                - Si es solicitud de nuevo módulo, mejora, cambio, reportes o permisos especiales: areaDestino = ADMIN.
                - tipoSolicitud: INCIDENCIA, CONSULTA o REQUERIMIENTO.
                - prioridad: BAJA, MEDIA o ALTA.
                - respuestaSugerida debe ser breve, clara y útil para el cliente.

                Título: %s
                Descripción: %s

                Formato:
                {
                  "tipoSolicitud": "",
                  "areaDestino": "",
                  "prioridad": "",
                  "respuestaSugerida": ""
                }
                """.formatted(request.getTitulo(), request.getDescripcion());

            String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + model
                    + ":generateContent?key="
                    + apiKey;

            String body = """
                {
                  "contents": [
                    {
                      "parts": [
                        {
                          "text": %s
                        }
                      ]
                    }
                  ]
                }
                """.formatted(mapper.writeValueAsString(prompt));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            JsonNode root = mapper.readTree(response.getBody());

            String text = root
                    .path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();

            text = text
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            return mapper.readValue(text, AnalizarTicketResponse.class);

        } catch (Exception e) {
            return new AnalizarTicketResponse(
                    "INCIDENCIA",
                    "TECNICO",
                    "MEDIA",
                    "No se pudo analizar con IA. El ticket será revisado por el equipo de soporte."
            );
        }
    }
}