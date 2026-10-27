export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          email: string | null
          id: string
          rol: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          rol?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          rol?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      clicks_whatsapp: {
        Row: {
          comercio_id: string
          created_at: string
          cupon_id: string
          device_id: string
          id: string
        }
        Insert: {
          comercio_id: string
          created_at?: string
          cupon_id: string
          device_id: string
          id?: string
        }
        Update: {
          comercio_id?: string
          created_at?: string
          cupon_id?: string
          device_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clicks_whatsapp_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clicks_whatsapp_cupon_id_fkey"
            columns: ["cupon_id"]
            isOneToOne: false
            referencedRelation: "cupones"
            referencedColumns: ["id"]
          },
        ]
      }
      colecciones: {
        Row: {
          created_at: string
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
          orden?: number
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      comercio_colecciones: {
        Row: {
          coleccion_id: string
          comercio_id: string
          created_at: string
        }
        Insert: {
          coleccion_id: string
          comercio_id: string
          created_at?: string
        }
        Update: {
          coleccion_id?: string
          comercio_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comercio_colecciones_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "colecciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comercio_colecciones_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
        ]
      }
      comercio_sedes: {
        Row: {
          comercio_id: string
          created_at: string
          direccion: string | null
          horarios: string | null
          id: string
          lat: number | null
          lng: number | null
          localidad_id: string | null
          updated_at: string
        }
        Insert: {
          comercio_id: string
          created_at?: string
          direccion?: string | null
          horarios?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          localidad_id?: string | null
          updated_at?: string
        }
        Update: {
          comercio_id?: string
          created_at?: string
          direccion?: string | null
          horarios?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          localidad_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comercio_sedes_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comercio_sedes_localidad_id_fkey"
            columns: ["localidad_id"]
            isOneToOne: false
            referencedRelation: "localidades"
            referencedColumns: ["id"]
          },
        ]
      }
      comercios: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          direccion: string | null
          es_indoor: boolean
          galeria: string[]
          hero_alcance_local: boolean
          horarios: string | null
          id: string
          lat: number | null
          lng: number | null
          localidad_id: string | null
          nombre: string
          plan_id: string
          posicion_tarjeta: string | null
          redes_sociales: Json
          rubro_id: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          direccion?: string | null
          es_indoor?: boolean
          galeria?: string[]
          hero_alcance_local?: boolean
          horarios?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          localidad_id?: string | null
          nombre: string
          plan_id: string
          posicion_tarjeta?: string | null
          redes_sociales?: Json
          rubro_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          direccion?: string | null
          es_indoor?: boolean
          galeria?: string[]
          hero_alcance_local?: boolean
          horarios?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          localidad_id?: string | null
          nombre?: string
          plan_id?: string
          posicion_tarjeta?: string | null
          redes_sociales?: Json
          rubro_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comercios_localidad_id_fkey"
            columns: ["localidad_id"]
            isOneToOne: false
            referencedRelation: "localidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comercios_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "planes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comercios_rubro_id_fkey"
            columns: ["rubro_id"]
            isOneToOne: false
            referencedRelation: "rubros"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion_global: {
        Row: {
          gift_box_visible: boolean
          giftbox_plantilla_pago: string
          giftbox_plantilla_regalo: string
          id: string
          updated_at: string
        }
        Insert: {
          gift_box_visible?: boolean
          giftbox_plantilla_pago?: string
          giftbox_plantilla_regalo?: string
          id?: string
          updated_at?: string
        }
        Update: {
          gift_box_visible?: boolean
          giftbox_plantilla_pago?: string
          giftbox_plantilla_regalo?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      cupon_activaciones: {
        Row: {
          comercio_id: string
          cupon_id: string
          fecha: string
          id: string
        }
        Insert: {
          comercio_id: string
          cupon_id: string
          fecha?: string
          id?: string
        }
        Update: {
          comercio_id?: string
          cupon_id?: string
          fecha?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cupon_activaciones_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cupon_activaciones_cupon_id_fkey"
            columns: ["cupon_id"]
            isOneToOne: false
            referencedRelation: "cupones"
            referencedColumns: ["id"]
          },
        ]
      }
      cupon_colecciones: {
        Row: {
          coleccion_id: string
          created_at: string
          cupon_id: string
        }
        Insert: {
          coleccion_id: string
          created_at?: string
          cupon_id: string
        }
        Update: {
          coleccion_id?: string
          created_at?: string
          cupon_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cupon_colecciones_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "colecciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cupon_colecciones_cupon_id_fkey"
            columns: ["cupon_id"]
            isOneToOne: false
            referencedRelation: "cupones"
            referencedColumns: ["id"]
          },
        ]
      }
      cupon_sedes: {
        Row: {
          created_at: string
          cupon_id: string
          id: string
          sede_id: string | null
        }
        Insert: {
          created_at?: string
          cupon_id: string
          id?: string
          sede_id?: string | null
        }
        Update: {
          created_at?: string
          cupon_id?: string
          id?: string
          sede_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cupon_sedes_cupon_id_fkey"
            columns: ["cupon_id"]
            isOneToOne: false
            referencedRelation: "cupones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cupon_sedes_sede_id_fkey"
            columns: ["sede_id"]
            isOneToOne: false
            referencedRelation: "comercio_sedes"
            referencedColumns: ["id"]
          },
        ]
      }
      cupones: {
        Row: {
          activo: boolean
          comercio_id: string
          cooldown_dias: number
          created_at: string
          descripcion: string | null
          es_favorita_home: boolean
          es_top_slider: boolean
          flyer_url: string | null
          hero_alcance_local: boolean
          id: string
          modalidad: Database["public"]["Enums"]["modalidad_cupon"]
          oferta_corta: string | null
          posicion_tarjeta: string | null
          primera_activacion: string | null
          qr_codigo: string
          titulo: string
          updated_at: string
          vigencia_fin: string
          vigencia_inicio: string
        }
        Insert: {
          activo?: boolean
          comercio_id: string
          cooldown_dias?: number
          created_at?: string
          descripcion?: string | null
          es_favorita_home?: boolean
          es_top_slider?: boolean
          flyer_url?: string | null
          hero_alcance_local?: boolean
          id?: string
          modalidad?: Database["public"]["Enums"]["modalidad_cupon"]
          oferta_corta?: string | null
          posicion_tarjeta?: string | null
          primera_activacion?: string | null
          qr_codigo?: string
          titulo: string
          updated_at?: string
          vigencia_fin: string
          vigencia_inicio?: string
        }
        Update: {
          activo?: boolean
          comercio_id?: string
          cooldown_dias?: number
          created_at?: string
          descripcion?: string | null
          es_favorita_home?: boolean
          es_top_slider?: boolean
          flyer_url?: string | null
          hero_alcance_local?: boolean
          id?: string
          modalidad?: Database["public"]["Enums"]["modalidad_cupon"]
          oferta_corta?: string | null
          posicion_tarjeta?: string | null
          primera_activacion?: string | null
          qr_codigo?: string
          titulo?: string
          updated_at?: string
          vigencia_fin?: string
          vigencia_inicio?: string
        }
        Relationships: [
          {
            foreignKeyName: "cupones_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_colecciones: {
        Row: {
          coleccion_id: string
          created_at: string
          evento_id: string
        }
        Insert: {
          coleccion_id: string
          created_at?: string
          evento_id: string
        }
        Update: {
          coleccion_id?: string
          created_at?: string
          evento_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evento_colecciones_coleccion_id_fkey"
            columns: ["coleccion_id"]
            isOneToOne: false
            referencedRelation: "colecciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evento_colecciones_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          comercio_id: string | null
          created_at: string
          descripcion: string | null
          es_favorita_home: boolean
          es_top_slider: boolean
          fecha_fin: string
          fecha_inicio: string
          hero_alcance_local: boolean
          id: string
          imagen_url: string | null
          lat: number | null
          lng: number | null
          localidad_id: string | null
          posicion_tarjeta: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          comercio_id?: string | null
          created_at?: string
          descripcion?: string | null
          es_favorita_home?: boolean
          es_top_slider?: boolean
          fecha_fin: string
          fecha_inicio?: string
          hero_alcance_local?: boolean
          id?: string
          imagen_url?: string | null
          lat?: number | null
          lng?: number | null
          localidad_id?: string | null
          posicion_tarjeta?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          comercio_id?: string | null
          created_at?: string
          descripcion?: string | null
          es_favorita_home?: boolean
          es_top_slider?: boolean
          fecha_fin?: string
          fecha_inicio?: string
          hero_alcance_local?: boolean
          id?: string
          imagen_url?: string | null
          lat?: number | null
          lng?: number | null
          localidad_id?: string | null
          posicion_tarjeta?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_localidad_id_fkey"
            columns: ["localidad_id"]
            isOneToOne: false
            referencedRelation: "localidades"
            referencedColumns: ["id"]
          },
        ]
      }
      giftbox_items: {
        Row: {
          activo: boolean
          categoria: Database["public"]["Enums"]["giftbox_categoria"]
          comercio_id: string | null
          created_at: string
          descripcion: string | null
          direccion: string | null
          galeria: string[]
          horarios: string | null
          id: string
          imagen_url: string | null
          lat: number | null
          lng: number | null
          localidad_id: string | null
          lugar: string | null
          nombre: string
          orden: number
          precio: number
          redes_sociales: Json
          updated_at: string
          vigencia_fin: string | null
          vigencia_inicio: string | null
          whatsapp: string | null
        }
        Insert: {
          activo?: boolean
          categoria: Database["public"]["Enums"]["giftbox_categoria"]
          comercio_id?: string | null
          created_at?: string
          descripcion?: string | null
          direccion?: string | null
          galeria?: string[]
          horarios?: string | null
          id?: string
          imagen_url?: string | null
          lat?: number | null
          lng?: number | null
          localidad_id?: string | null
          lugar?: string | null
          nombre: string
          orden?: number
          precio?: number
          redes_sociales?: Json
          updated_at?: string
          vigencia_fin?: string | null
          vigencia_inicio?: string | null
          whatsapp?: string | null
        }
        Update: {
          activo?: boolean
          categoria?: Database["public"]["Enums"]["giftbox_categoria"]
          comercio_id?: string | null
          created_at?: string
          descripcion?: string | null
          direccion?: string | null
          galeria?: string[]
          horarios?: string | null
          id?: string
          imagen_url?: string | null
          lat?: number | null
          lng?: number | null
          localidad_id?: string | null
          lugar?: string | null
          nombre?: string
          orden?: number
          precio?: number
          redes_sociales?: Json
          updated_at?: string
          vigencia_fin?: string | null
          vigencia_inicio?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "giftbox_items_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "giftbox_items_localidad_id_fkey"
            columns: ["localidad_id"]
            isOneToOne: false
            referencedRelation: "localidades"
            referencedColumns: ["id"]
          },
        ]
      }
      giftbox_pedidos: {
        Row: {
          agasajado_nombre: string | null
          agasajado_whatsapp: string | null
          contacto_nombre: string | null
          contacto_whatsapp: string | null
          datos_completados_at: string | null
          dedicatoria: string | null
          device_id: string | null
          direccion_entrega: string | null
          estado: Database["public"]["Enums"]["giftbox_estado"]
          fecha: string
          fecha_regalo: string | null
          formato: Database["public"]["Enums"]["giftbox_formato"]
          id: string
          items_seleccionados: Json
          link_pago: string | null
          mensaje_pago_enviado_at: string | null
          notas_internas: string | null
          ocasion: string | null
          pagado_at: string | null
          precio_total: number
          regalo_enviado_at: string | null
          remitente_firma: string | null
          token_formulario: string
          token_regalo: string
        }
        Insert: {
          agasajado_nombre?: string | null
          agasajado_whatsapp?: string | null
          contacto_nombre?: string | null
          contacto_whatsapp?: string | null
          datos_completados_at?: string | null
          dedicatoria?: string | null
          device_id?: string | null
          direccion_entrega?: string | null
          estado?: Database["public"]["Enums"]["giftbox_estado"]
          fecha?: string
          fecha_regalo?: string | null
          formato?: Database["public"]["Enums"]["giftbox_formato"]
          id?: string
          items_seleccionados?: Json
          link_pago?: string | null
          mensaje_pago_enviado_at?: string | null
          notas_internas?: string | null
          ocasion?: string | null
          pagado_at?: string | null
          precio_total?: number
          regalo_enviado_at?: string | null
          remitente_firma?: string | null
          token_formulario?: string
          token_regalo?: string
        }
        Update: {
          agasajado_nombre?: string | null
          agasajado_whatsapp?: string | null
          contacto_nombre?: string | null
          contacto_whatsapp?: string | null
          datos_completados_at?: string | null
          dedicatoria?: string | null
          device_id?: string | null
          direccion_entrega?: string | null
          estado?: Database["public"]["Enums"]["giftbox_estado"]
          fecha?: string
          fecha_regalo?: string | null
          formato?: Database["public"]["Enums"]["giftbox_formato"]
          id?: string
          items_seleccionados?: Json
          link_pago?: string | null
          mensaje_pago_enviado_at?: string | null
          notas_internas?: string | null
          ocasion?: string | null
          pagado_at?: string | null
          precio_total?: number
          regalo_enviado_at?: string | null
          remitente_firma?: string | null
          token_formulario?: string
          token_regalo?: string
        }
        Relationships: []
      }
      huella_solidaria_fases: {
        Row: {
          created_at: string
          descripcion: string | null
          fecha: string
          fotos: string[]
          id: string
          publicado: boolean
          tipo: Database["public"]["Enums"]["fase_tipo"]
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          fecha?: string
          fotos?: string[]
          id?: string
          publicado?: boolean
          tipo?: Database["public"]["Enums"]["fase_tipo"]
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          fecha?: string
          fotos?: string[]
          id?: string
          publicado?: boolean
          tipo?: Database["public"]["Enums"]["fase_tipo"]
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      interacciones_comercio: {
        Row: {
          comercio_id: string
          device_id: string | null
          fecha: string
          id: string
        }
        Insert: {
          comercio_id: string
          device_id?: string | null
          fecha?: string
          id?: string
        }
        Update: {
          comercio_id?: string
          device_id?: string | null
          fecha?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interacciones_comercio_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_comercios: {
        Row: {
          fecha: string
          id: string
          localidad: string | null
          nombre_local: string
          rubro: string | null
          whatsapp: string
        }
        Insert: {
          fecha?: string
          id?: string
          localidad?: string | null
          nombre_local: string
          rubro?: string | null
          whatsapp: string
        }
        Update: {
          fecha?: string
          id?: string
          localidad?: string | null
          nombre_local?: string
          rubro?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      localidades: {
        Row: {
          created_at: string
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      metricas_mensuales: {
        Row: {
          comercio_id: string
          created_at: string
          cupon_top_id: string | null
          id: string
          mes: string
          total_interacciones: number
          total_redenciones: number
          updated_at: string
        }
        Insert: {
          comercio_id: string
          created_at?: string
          cupon_top_id?: string | null
          id?: string
          mes: string
          total_interacciones?: number
          total_redenciones?: number
          updated_at?: string
        }
        Update: {
          comercio_id?: string
          created_at?: string
          cupon_top_id?: string | null
          id?: string
          mes?: string
          total_interacciones?: number
          total_redenciones?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "metricas_mensuales_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metricas_mensuales_cupon_top_id_fkey"
            columns: ["cupon_top_id"]
            isOneToOne: false
            referencedRelation: "cupones"
            referencedColumns: ["id"]
          },
        ]
      }
      planes: {
        Row: {
          aparece_en_grilla: boolean
          aparece_en_hero_banner: boolean
          created_at: string
          id: string
          max_cupones_activos: number
          nombre: string
          prioridad_orden: number
          puede_reservar_whatsapp: boolean
          tiene_modulo_promocion: boolean
          updated_at: string
        }
        Insert: {
          aparece_en_grilla?: boolean
          aparece_en_hero_banner?: boolean
          created_at?: string
          id?: string
          max_cupones_activos?: number
          nombre: string
          prioridad_orden?: number
          puede_reservar_whatsapp?: boolean
          tiene_modulo_promocion?: boolean
          updated_at?: string
        }
        Update: {
          aparece_en_grilla?: boolean
          aparece_en_hero_banner?: boolean
          created_at?: string
          id?: string
          max_cupones_activos?: number
          nombre?: string
          prioridad_orden?: number
          puede_reservar_whatsapp?: boolean
          tiene_modulo_promocion?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      postulaciones_solidarias: {
        Row: {
          causa: string
          descripcion: string | null
          fecha: string
          id: string
          localidad: string | null
          nombre: string
        }
        Insert: {
          causa: string
          descripcion?: string | null
          fecha?: string
          id?: string
          localidad?: string | null
          nombre: string
        }
        Update: {
          causa?: string
          descripcion?: string | null
          fecha?: string
          id?: string
          localidad?: string | null
          nombre?: string
        }
        Relationships: []
      }
      redenciones: {
        Row: {
          comercio_id: string
          cupon_id: string
          device_id: string
          fecha_redencion: string
          id: string
        }
        Insert: {
          comercio_id: string
          cupon_id: string
          device_id: string
          fecha_redencion?: string
          id?: string
        }
        Update: {
          comercio_id?: string
          cupon_id?: string
          device_id?: string
          fecha_redencion?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redenciones_comercio_id_fkey"
            columns: ["comercio_id"]
            isOneToOne: false
            referencedRelation: "comercios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redenciones_cupon_id_fkey"
            columns: ["cupon_id"]
            isOneToOne: false
            referencedRelation: "cupones"
            referencedColumns: ["id"]
          },
        ]
      }
      rubros: {
        Row: {
          created_at: string
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activar_cupon_presencial: {
        Args: { p_cupon_id: string; p_device_id: string; p_qr_codigo: string }
        Returns: Json
      }
      crear_pedido_giftbox: {
        Args: {
          p_device_id?: string
          p_formato: Database["public"]["Enums"]["giftbox_formato"]
          p_item_ids: string[]
          p_nombre: string
          p_whatsapp: string
        }
        Returns: Json
      }
      cupon_activado_este_mes: {
        Args: { p_cupon_id: string }
        Returns: boolean
      }
      cupos_promos_mes: { Args: { p_comercio_id: string }; Returns: Json }
      estado_cupon_device: {
        Args: { p_cupon_id: string; p_device_id: string }
        Returns: Json
      }
      existe_admin: { Args: never; Returns: boolean }
      giftbox_formulario_info: { Args: { p_token: string }; Returns: Json }
      giftbox_guardar_datos: {
        Args: {
          p_agasajado_nombre: string
          p_agasajado_whatsapp: string
          p_dedicatoria: string
          p_direccion_entrega: string
          p_fecha_regalo: string
          p_ocasion: string
          p_remitente_firma: string
          p_token: string
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      puede_activar_cupon: {
        Args: { p_cupon_id: string; p_device_id: string }
        Returns: Json
      }
      recalcular_metricas_mensuales: {
        Args: { p_mes?: string }
        Returns: number
      }
      redimir_cupon: {
        Args: { p_cupon_id: string; p_device_id: string }
        Returns: Json
      }
      reset_mensual_cupones: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "super_admin" | "admin"
      fase_tipo: "actual" | "historial"
      giftbox_categoria: "Noche" | "Sabor" | "Relax" | "Diversión"
      giftbox_estado:
        | "pendiente"
        | "contactado"
        | "confirmado"
        | "entregado"
        | "cancelado"
      giftbox_formato: "digital" | "fisico"
      modalidad_cupon: "presencial" | "whatsapp"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin"],
      fase_tipo: ["actual", "historial"],
      giftbox_categoria: ["Noche", "Sabor", "Relax", "Diversión"],
      giftbox_estado: [
        "pendiente",
        "contactado",
        "confirmado",
        "entregado",
        "cancelado",
      ],
      giftbox_formato: ["digital", "fisico"],
      modalidad_cupon: ["presencial", "whatsapp"],
    },
  },
} as const
