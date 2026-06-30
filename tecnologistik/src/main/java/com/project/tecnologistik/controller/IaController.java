package com.project.tecnologistik.controller;

import com.project.tecnologistik.dto.AnalizarTicketRequest;
import com.project.tecnologistik.dto.AnalizarTicketResponse;
import com.project.tecnologistik.service.GeminiIaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ia")
@CrossOrigin("*")
public class IaController {

    private final GeminiIaService geminiIaService;

    public IaController(GeminiIaService geminiIaService) {
        this.geminiIaService = geminiIaService;
    }

    @PostMapping("/analizar-ticket")
    public ResponseEntity<AnalizarTicketResponse> analizarTicket(
            @RequestBody AnalizarTicketRequest request
    ) {
        return ResponseEntity.ok(
                geminiIaService.analizarTicket(request)
        );
    }
}