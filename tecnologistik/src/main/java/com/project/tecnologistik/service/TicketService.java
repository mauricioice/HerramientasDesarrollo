package com.project.tecnologistik.service;

import com.project.tecnologistik.dto.TicketRequest;
import com.project.tecnologistik.model.Categoria;
import com.project.tecnologistik.model.HistorialTicket;
import com.project.tecnologistik.model.Ticket;
import com.project.tecnologistik.model.Usuario;
import com.project.tecnologistik.repository.CategoriaRepository;
import com.project.tecnologistik.repository.HistorialTicketRepository;
import com.project.tecnologistik.repository.TicketRepository;
import com.project.tecnologistik.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final HistorialTicketRepository historialTicketRepository;

    public TicketService(
            TicketRepository ticketRepository,
            CategoriaRepository categoriaRepository,
            UsuarioRepository usuarioRepository,
            HistorialTicketRepository historialTicketRepository
    ) {
        this.ticketRepository = ticketRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
        this.historialTicketRepository = historialTicketRepository;
    }

    public Ticket crearTicket(TicketRequest request, UUID usuarioId) {

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        Ticket ticket = new Ticket();

        ticket.setCodigo("TK-" + System.currentTimeMillis());
        ticket.setTitulo(request.getTitulo());
        ticket.setDescripcion(request.getDescripcion());
        ticket.setPrioridad(request.getPrioridad());
        ticket.setFechaLimite(request.getFechaLimite());
        ticket.setTiempoEstimadoHoras(request.getTiempoEstimadoHoras());
        ticket.setEstado("ABIERTO");
        ticket.setFechaCreacion(LocalDateTime.now());
        ticket.setUsuario(usuario);
        ticket.setCategoria(categoria);

        Ticket ticketGuardado = ticketRepository.save(ticket);

        guardarHistorial(
                ticketGuardado,
                usuario,
                "CREACION",
                "Ticket creado correctamente"
        );

        return ticketGuardado;
    }

    public List<Ticket> listarTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> listarTicketsPorUsuario(UUID usuarioId) {
        return ticketRepository.findTicketsByUsuarioId(usuarioId);
    }

    public List<Ticket> listarTicketsPorTecnico(UUID tecnicoId) {
        return ticketRepository.findTicketsByTecnicoId(tecnicoId);
    }

    public Ticket obtenerTicket(UUID id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
    }

    public Ticket editarTicket(UUID id, TicketRequest request, UUID usuarioAccionId) {

        Ticket ticket = obtenerTicket(id);

        Usuario usuarioAccion = usuarioRepository.findById(usuarioAccionId)
                .orElseThrow(() -> new RuntimeException("Usuario acción no encontrado"));

        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        ticket.setTitulo(request.getTitulo());
        ticket.setDescripcion(request.getDescripcion());
        ticket.setPrioridad(request.getPrioridad());
        ticket.setCategoria(categoria);
        ticket.setFechaLimite(request.getFechaLimite());
        ticket.setTiempoEstimadoHoras(request.getTiempoEstimadoHoras());

        Ticket actualizado = ticketRepository.save(ticket);

        guardarHistorial(
                actualizado,
                usuarioAccion,
                "EDICION",
                "Ticket editado correctamente"
        );

        return actualizado;
    }

    public void eliminarTicket(UUID id, UUID usuarioAccionId) {

        Ticket ticket = obtenerTicket(id);

        Usuario usuarioAccion = usuarioRepository.findById(usuarioAccionId)
                .orElseThrow(() -> new RuntimeException("Usuario acción no encontrado"));

        guardarHistorial(
                ticket,
                usuarioAccion,
                "ELIMINACION",
                "Ticket eliminado del sistema"
        );

        ticketRepository.delete(ticket);
    }

    public Ticket asignarTecnico(
            UUID ticketId,
            UUID tecnicoId,
            UUID usuarioAccionId
    ) {

        Ticket ticket = obtenerTicket(ticketId);

        Usuario tecnico = usuarioRepository.findById(tecnicoId)
                .orElseThrow(() -> new RuntimeException("Técnico no encontrado"));

        Usuario usuarioAccion = usuarioRepository.findById(usuarioAccionId)
                .orElseThrow(() -> new RuntimeException("Usuario acción no encontrado"));

        ticket.setTecnico(tecnico);
        ticket.setEstado("ASIGNADO");

        Ticket actualizado = ticketRepository.save(ticket);

        guardarHistorial(
                actualizado,
                usuarioAccion,
                "ASIGNACION",
                "Ticket asignado al técnico: " + tecnico.getNombreCompleto()
        );

        return actualizado;
    }

    public Ticket cambiarEstado(
            UUID ticketId,
            String nuevoEstado,
            UUID usuarioAccionId
    ) {

        Ticket ticket = obtenerTicket(ticketId);

        Usuario usuarioAccion = usuarioRepository.findById(usuarioAccionId)
                .orElseThrow(() -> new RuntimeException("Usuario acción no encontrado"));

        String estadoAnterior = ticket.getEstado();

        ticket.setEstado(nuevoEstado);

        if ("RESUELTO".equals(nuevoEstado) || "CERRADO".equals(nuevoEstado)) {
            ticket.setObservacionResolucion("Ticket marcado como " + nuevoEstado);
        }

        Ticket actualizado = ticketRepository.save(ticket);

        guardarHistorial(
                actualizado,
                usuarioAccion,
                "CAMBIO_ESTADO",
                "Estado cambiado de " + estadoAnterior + " a " + nuevoEstado
        );

        return actualizado;
    }

    public List<HistorialTicket> obtenerHistorial(UUID ticketId) {
        return historialTicketRepository.findByTicketIdOrderByFechaDesc(ticketId);
    }

    private void guardarHistorial(
            Ticket ticket,
            Usuario usuario,
            String accion,
            String comentario
    ) {

        HistorialTicket historial = new HistorialTicket();

        historial.setTicket(ticket);
        historial.setUsuario(usuario);
        historial.setAccion(accion);
        historial.setComentario(comentario);
        historial.setFecha(LocalDateTime.now());

        historialTicketRepository.save(historial);
    }
}