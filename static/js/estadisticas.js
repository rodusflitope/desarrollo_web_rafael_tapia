document.addEventListener('DOMContentLoaded', function () {
    cargarGraficos();
});
async function cargarGraficos() {
    try {
        console.log('Cargando datos de las estadísticas para los gráficos...');
        const datosActividadDia = await fetch('/api/estadisticas/actividades-por-dia')
            .then(response => response.json());
        const datosActividadTipo = await fetch('/api/estadisticas/actividades-por-tipo')
            .then(response => response.json());
        const datosActividadMes = await fetch('/api/estadisticas/actividades-por-mes')
            .then(response => response.json());
        console.log('Datos de las estadísticas cargados:', {
            datosActividadDia,
            datosActividadTipo,
            datosActividadMes
        });
        Highcharts.chart('grafico-actividades-dia', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Actividad por Día'
            },
            xAxis: {
                categories: datosActividadDia.map(item => item.fecha)
            },
            yAxis: {
                title: {
                    text: 'Número de Actividades'
                }
            },
            series: [{
                name: 'Actividades',
                data: datosActividadDia.map(item => item.cantidad)
            }]
        });
        Highcharts.chart('grafico-actividades-tipo', {
            chart: {
                type: 'pie'
            },
            title: {
                text: 'Actividad por Tipo'
            },
            series: [{
                name: 'Tipos de Actividad',
                data: datosActividadTipo.map(item => ({
                    name: item.tema,
                    y: item.cantidad
                })),
                size: '80%',
                showInLegend: true,
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.y}'
                }
            }]
        });
        Highcharts.chart('grafico-actividades-dia-mes', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Actividades por Momento del Día y Mes'
            },
            xAxis: {
                categories: datosActividadMes.map(item => item.mes)
            },
            yAxis: {
                title: {
                    text: 'Número de Actividades'
                }
            },
            series: [{
                name: 'Mañana',
                data: datosActividadMes.map(item => item.mañana)
            }, {
                name: 'Mediodía',
                data: datosActividadMes.map(item => item.mediodia)
            }, {
                name: 'Tarde',
                data: datosActividadMes.map(item => item.tarde)
            }]
        });
    } catch (error) {
        console.error('Error al cargar los datos de las estadísticas para los graficos:', error);
        return;
    }
}