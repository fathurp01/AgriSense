const temperatureChartCtx = document.getElementById("temperatureChart").getContext("2d");
const humidityChartCtx = document.getElementById("humidityChart").getContext("2d");
const temperatureSpeedometer = document.getElementById("temperatureSpeedometer").getContext("2d");
const humiditySpeedometerCtx = document.getElementById("humiditySpeedometer").getContext("2d");

const temperatureChart = new Chart(temperatureChartCtx, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: "Suhu (°C)",
                data: [],
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
                fill: false,
            },
        ],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { title: { display: true, text: "Waktu" } },
            y: { title: { display: true, text: "Suhu (°C)" } },
        },
    },
});

const humidityChart = new Chart(humidityChartCtx, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: "Kelembapan (%)",
                data: [],
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
                fill: false,
            },
        ],
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { title: { display: true, text: "Waktu" } },
            y: { title: { display: true, text: "Kelembapan (%)" } },
        },
    },
});

// Temperature Speedometer (Doughnut chart)
const tempSpeedometer = new Chart(temperatureSpeedometer, {
    type: 'doughnut',
    data: {
        labels: ['Suhu'],
        datasets: [{
            data: [0, 100],  // Initial data (Suhu: 0)
            backgroundColor: ['#FF6384', '#ddd'],
            borderColor: ['#FF6384', '#ddd'],
            borderWidth: 1,
            hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
        rotation: -90,
        circumference: 180,
        cutoutPercentage: 80,
        plugins: {
            tooltip: {
                enabled: false
            },
            legend: {
                display: false
            }
        },
        animation: {
            animateRotate: true
        }
    }
});

// Humidity Speedometer (Doughnut chart)
const humiditySpeedometer = new Chart(humiditySpeedometerCtx, {
    type: 'doughnut',
    data: {
        labels: ['Kelembapan'],
        datasets: [{
            data: [0, 100],  // Initial data (Humidity: 0)
            backgroundColor: ['#36A2EB', '#ddd'],
            borderColor: ['#36A2EB', '#ddd'],
            borderWidth: 1,
            hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
        rotation: -90,
        circumference: 180,
        cutoutPercentage: 80,
        plugins: {
            tooltip: {
                enabled: false
            },
            legend: {
                display: false
            }
        },
        animation: {
            animateRotate: true
        }
    }
});


function checkTemperatureStatus(temperature) {
    if (24 <= temperature && temperature <= 30) {
        return "Optimal";
    } else if (temperature < 24) {
        return "Terlalu Rendah";
    } else if (temperature > 30) {
        return "Terlalu Tinggi";
    }
}

function checkHumidityStatus(humidity) {
    if (50 <= humidity && humidity <= 80) {
        return "Optimal";
    } else if (humidity < 50) {
        return "Terlalu Rendah";
    } else if (humidity > 80) {
        return "Terlalu Tinggi";
    }
}

function showNotification(temperatureStatus, humidityStatus) {
    const notificationContainer = document.getElementById("notification-container");

    // Hapus semua notifikasi yang ada sebelum menambahkan yang baru
    notificationContainer.innerHTML = "";

    // Membuat elemen notifikasi untuk suhu
    const tempNotification = document.createElement("div");
    tempNotification.classList.add("notification", temperatureStatus === "Optimal" ? "success" : "warning");
    tempNotification.textContent = `Suhu: ${temperatureStatus}`;
    
    // Membuat elemen notifikasi untuk kelembapan
    const humidityNotification = document.createElement("div");
    humidityNotification.classList.add("notification", humidityStatus === "Optimal" ? "success" : "warning");
    humidityNotification.textContent = `Kelembapan: ${humidityStatus}`;

    // Menambahkan kedua notifikasi ke dalam kontainer
    notificationContainer.appendChild(tempNotification);
    notificationContainer.appendChild(humidityNotification);

    // Hapus notifikasi setelah 3 detik
    setTimeout(() => {
        tempNotification.remove();
        humidityNotification.remove();
    }, 3000);
}



function updateCharts(timestamp, suhu, kelembapan) {
    if (temperatureChart.data.labels.length > 20) {
        temperatureChart.data.labels.shift();
        temperatureChart.data.datasets[0].data.shift();
    }
    temperatureChart.data.labels.push(timestamp);
    temperatureChart.data.datasets[0].data.push(suhu);
    temperatureChart.update();

    if (humidityChart.data.labels.length > 20) {
        humidityChart.data.labels.shift();
        humidityChart.data.datasets[0].data.shift();
    }
    humidityChart.data.labels.push(timestamp);
    humidityChart.data.datasets[0].data.push(kelembapan);
    humidityChart.update();
}

function updateStatus() {
    fetch('/get_status')
    .then(response => response.json())
    .then(data => {
        console.log(data); // Tambahkan log ini
        if (data.Suhu != null && data.Kelembapan != null) {
            const suhuElement = document.getElementById("status-Suhu");
            suhuElement.textContent = data.Suhu.toFixed(2) + "°C";

            const kelembapanElement = document.getElementById("status-Kelembapan");
            kelembapanElement.textContent = data.Kelembapan.toFixed(2) + "%";

            const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            updateCharts(currentTime, data.Suhu, data.Kelembapan);

            // Update speedometer charts
            tempSpeedometer.data.datasets[0].data = [data.Suhu, 100 - data.Suhu];
            humiditySpeedometer.data.datasets[0].data = [data.Kelembapan, 100 - data.Kelembapan];

            tempSpeedometer.update();
            humiditySpeedometer.update();

            // Call showNotification with the current temperature and humidity status
            const tempStatus = checkTemperatureStatus(data.Suhu); // Dapatkan status suhu
            const humidityStatus = checkHumidityStatus(data.Kelembapan); // Dapatkan status kelembapan

            // Menampilkan kedua notifikasi
            showNotification(tempStatus, humidityStatus);
        } else {
            console.warn('Data tidak valid:', data);
        }
    })
    .catch(error => console.error('Error fetching status:', error));
}

setInterval(updateStatus, 2000);
