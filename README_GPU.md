# Guía de Post-Producción en PC con GPU NVIDIA (VACE + Wav2Lip)

Este documento te guía para terminar el videoclip en tu computador secundario usando inteligencia artificial local de **costo cero**.

## Paso 1: Descargar el Proyecto
1. En el PC con GPU, abre la terminal y clona este repositorio:
```bash
git clone https://github.com/bess-solutions/jotaoselagos-video-pipeline.git
cd jotaoselagos-video-pipeline
```
2. Conecta el pendrive y copia el archivo `JotaoseLagos_Assets.zip` que generamos.
3. Descomprímelo y coloca la carpeta `content` dentro de la carpeta del proyecto.

## Paso 2: Face Swap (VACE) - Reemplazar la cara del protagonista
VACE tomará la foto real de JotaoseLagos (ubicada en `content/shared`) y la colocará sobre el actor en los videos de `content/v3_narrativo/clip_0.mp4`, etc.

**Instalación y Ejecución:**
```bash
# 1. Clona el repositorio de VACE junto a esta carpeta
cd ..
git clone https://github.com/ali-vilab/VACE.git
cd VACE

# 2. Instala los requerimientos de Python
pip install -r requirements.txt

# 3. Ejecuta el reemplazo de rostro (ejemplo para el clip 0)
python infer.py --task face_swap --video_path ../jotaoselagos-video-pipeline/content/v3_narrativo/clip_0.mp4 --face_image ../jotaoselagos-video-pipeline/content/shared/jota.jpg --output_path ../jotaoselagos-video-pipeline/content/v3_narrativo/clip_0_faceswap.mp4
```
*(Debes repetir el comando python para los clips que quieras reemplazar).*

## Paso 3: Lip Sync (Easy-Wav2Lip) - Sincronizar la boca
Wav2Lip tomará los videos ya con la cara de JotaoseLagos y sincronizará los labios al ritmo del `.wav`.

**Instalación y Ejecución:**
```bash
# 1. Clona Easy-Wav2Lip
cd ..
git clone https://github.com/anothermartz/Easy-Wav2Lip
cd Easy-Wav2Lip

# 2. Ejecuta el instalador (doble clic en install.bat si estás en Windows)
# 3. Sincroniza la boca (ejemplo para el clip 0)
python easy_wav2lip.py --video ../jotaoselagos-video-pipeline/content/v3_narrativo/clip_0_faceswap.mp4 --audio ../jotaoselagos-video-pipeline/content/shared/CADA_VEZ_QUE_ESCRIBO_CON_SCRATCH.wav --output ../jotaoselagos-video-pipeline/content/v3_narrativo/clip_0_final.mp4
```

## Paso 4: Ensamblaje Final
Cuando tengas todos los `clip_X_final.mp4`, puedes usar el script de node original para pegarlos:
```bash
cd ../jotaoselagos-video-pipeline
node index.js narrativo
```
