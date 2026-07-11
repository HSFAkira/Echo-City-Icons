(function() {
    // Configuración básica del gráfico
    const MAX_VALOR = 10; // Máximo fijo por defecto (1 al 10)
    const TAMANO = 200;   // Ancho y alto del SVG en píxeles
    const CENTRO = TAMANO / 2;
    const RADIO = (TAMANO / 2) - 20; // Margen para los textos

    // Función matemática para obtener las coordenadas de un punto en el círculo
    const obtenerCoordenadas = (indice, valor, maximo) => {
        const angulo = (Math.PI * 2 / 5) * indice - (Math.PI / 2); // -90 grados para empezar arriba
        const distancia = (valor / maximo) * RADIO;
        return {
            x: CENTRO + distancia * Math.cos(angulo),
            y: CENTRO + distancia * Math.sin(angulo)
        };
    };

    const generarGraficoPentagono = () => {
        // Selector del campo original (usa la clase que genera tu script clasificador)
        const camposStats = document.querySelectorAll('.postprofile-info .fieldProfilePost.statsRpg');

        camposStats.forEach(campo => {
            const contenedorContenido = campo.querySelector('.fieldProfilePostCont');
            if (!contenedorContenido || campo.querySelector('.rpg-chart-container')) return;

            const textoOriginal = contenedorContenido.textContent.trim();
            if (!textoOriginal) return;

            // 1. PARSEAR LAS STATS (Soporta comas, espacios o saltos de línea)
            const regex = /([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s*:\s*(\hd+)/g;
            let coincidencias;
            const stats = [];

            while ((coincidencias = regex.exec(textoOriginal)) !== null) {
                stats.push({
                    nombre: coincidencias[1],
                    valor: Math.min(Math.max(parseInt(coincidencias[2], 10), 0), MAX_VALOR) // Cap entre 0 y MAX
                });
            }

            // Si el usuario no puso exactamente 5 stats, no dibujamos para no romper el pentágono
            if (stats.length !== 5) return;

            // OPCIONAL: Si prefieres que el máximo sea dinámico basado en la stat más alta, descomenta la línea de abajo:
            // const maximoGrafico = Math.max(...stats.map(s => s.valor), 1);
            const maximoGrafico = MAX_VALOR; 

            // 2. CONSTRUIR EL SVG
            // Dibujar la red de fondo (Pentágonos concéntricos de guía: Niveles 2.5, 5, 7.5, 10)
            let lineasGuiaHTML = '';
            for (let nivel = 1; nivel <= 4; nivel++) {
                const escala = nivel / 4;
                const puntosGuia = [];
                for (let i = 0; i < 5; i++) {
                    const p = obtenerCoordenadas(i, escala * maximoGrafico, maximoGrafico);
                    puntosGuia.push(`${p.x},${p.y}`);
                }
                lineasGuiaHTML += `<polygon points="${puntosGuia.join(' ')}" class="chart-grid-line" />`;
            }

            // Dibujar los ejes desde el centro a las esquinas
            let ejesHTML = '';
            let textosHTML = '';
            const puntosUsuario = [];

            stats.forEach((stat, i) => {
                const pMax = obtenerCoordenadas(i, maximoGrafico, maximoGrafico);
                const pUser = obtenerCoordenadas(i, stat.valor, maximoGrafico);
                
                puntosUsuario.push(`${pUser.x},${pUser.y}`);

                // Línea del eje
                ejesHTML += `<line x1="${CENTRO}" y1="${CENTRO}" x2="${pMax.x}" y2="${pMax.y}" class="chart-axis" />`;

                // Posicionar las etiquetas de texto con pequeños ajustes para que no se corten
                let anchor = 'middle';
                let ajusteY = 0;
                if (pMax.x < CENTRO - 10) anchor = 'end';
                if (pMax.x > CENTRO + 10) anchor = 'start';
                if (pMax.y > CENTRO + 10) ajusteY = 12;
                if (pMax.y < CENTRO - 10) ajusteY = -5;

                textosHTML += `<text x="${pMax.x}" y="${pMax.y + ajusteY}" text-anchor="${anchor}" class="chart-label">${stat.nombre} (${stat.valor})</text>`;
            });

            // Ensamblar todo el SVG
            const svgHTML = `
                <div class="rpg-chart-container">
                    <svg viewBox="0 0 ${TAMANO} ${TAMANO}" width="100%" height="100%">
                        <!-- Red de fondo -->
                        ${lineasGuiaHTML}
                        ${ejesHTML}
                        <!-- Polígono de stats del usuario -->
                        <polygon points="${puntosUsuario.join(' ')}" class="chart-user-polygon" />
                        <!-- Puntos en los vértices del usuario -->
                        ${stats.map((stat, i) => {
                            const p = obtenerCoordenadas(i, stat.valor, maximoGrafico);
                            return `<circle cx="${p.x}" cy="${p.y}" r="3" class="chart-user-point" />`;
                        }).join('')}
                        <!-- Textos de las stats -->
                        ${textosHTML}
                    </svg>
                </div>
            `;

            // Ocultamos el texto feo original e inyectamos el gráfico visual
            contenedorContenido.style.display = 'none';
            campo.insertAdjacentHTML('beforeend', svgHTML);
        });
    };

    // Ejecución continua por si hay carga asíncrona
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', generarGraficoPentagono);
    } else {
        generarGraficoPentagono();
    }
    setTimeout(generarGraficoPentagono, 600);
})();