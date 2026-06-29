package com.project.tecnologistik.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true)
    private String codigo;

    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private String estado;

    private String prioridad;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaLimite;

    private Integer tiempoEstimadoHoras;

    @Column(columnDefinition = "TEXT")
    private String observacionResolucion;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "tecnico_id")
    private Usuario tecnico;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    // getters y setters

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public LocalDateTime getFechaLimite() { return fechaLimite; }
    public void setFechaLimite(LocalDateTime fechaLimite) { this.fechaLimite = fechaLimite; }

    public Integer getTiempoEstimadoHoras() { return tiempoEstimadoHoras; }
    public void setTiempoEstimadoHoras(Integer tiempoEstimadoHoras) { this.tiempoEstimadoHoras = tiempoEstimadoHoras; }

    public String getObservacionResolucion() { return observacionResolucion; }
    public void setObservacionResolucion(String observacionResolucion) { this.observacionResolucion = observacionResolucion; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Usuario getTecnico() { return tecnico; }
    public void setTecnico(Usuario tecnico) { this.tecnico = tecnico; }

    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
}