# Diario de Desarrollo & Roadmaps (Multiverso)

Este documento registra la evolución arquitectónica del proyecto **Video Maker 10000% Monetizable** para JotaoseLagos.

## 🚀 ROADMAP V3: El Director de Cine IA (Modo Narrativo)
**Estado:** Activo y Recomendado
**Comando:** `node index.js narrativo`
**Archivos:** `robots/scriptwriter.js`, `robots/video_generator_v3.js`, `robots/video_v3_narrativo.js`
**Carpeta:** `content/v3_narrativo/`

### ¿Por qué lo hicimos?
El usuario quería una producción 100% premium, con trama, guion y consistencia visual. Sin embargo, la API de Google bloqueaba el rostro real del artista (filtros Deepfake).
### ¿Cómo funciona?
1. **Gemini 2.5 Flash (`scriptwriter.js`)** lee la canción y escribe un Guion Técnico.
2. Inventa un protagonista urbano que funciona como avatar del artista (evadiendo filtros).
3. **Google Veo 3.1 (`video_generator_v3.js`)** graba los clips basados en este guion.
4. **FFmpeg (`video_v3_narrativo.js`)** sincroniza la película, el audio y los subtítulos.

---

## 📸 ROADMAP V2: El Documental (Efecto Ken Burns)
**Estado:** Activo (Alternativa Local)
**Comando:** `node index.js documental`
**Archivos:** `robots/video_v2_documental.js`
**Carpeta:** `content/v2_documental/`

### ¿Por qué lo hicimos?
Como Google censuraba el rostro de JotaoseLagos en la V1, el usuario solicitó usar fotos reales del artista localmente para no perder su identidad.
### ¿Cómo funciona?
1. El usuario coloca fotos `.jpg` en la carpeta `content/shared/`.
2. FFmpeg lee las letras y anima las fotos usando efectos matemáticos (Zoom, Pan, Tilt) exactamente al ritmo de cada barra.
3. El resultado es un "Lyric Video" rápido (1 minuto de renderizado) y 100% seguro contra censura. El usuario indicó que se veía "básico/PowerPoint", por lo que pasamos a la V3.

---

## ❌ ROADMAP V1: IA Premium (Neon/ArtStation)
**Estado:** Obsoleto / Reemplazado
**Archivos:** Eliminados en la refactorización.
### ¿Qué pasó?
Intentamos que Veo 3.1 generara directamente un video hiperrealista en 4K con estética de neón, nombrando directamente a JotaoseLagos en el prompt. 
**Fracaso:**
1. Desconexión estética: La vibra del artista es "Underground" (Hip Hop de los 90s, granulado, decaimiento urbano), y la IA estaba generando comerciales de zapatillas de lujo.
2. Censura: Nombrar al artista activaba los cortafuegos Anti-Deepfake de Google (Error 400).
3. Solución: Evolucionamos hacia el **Roadmap V3**.
