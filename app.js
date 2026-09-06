// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyBbCtWZDMtNB38YUfbWPSGe2Fv0so1n8",

    authDomain:
        "smart-dispenser-b4450.firebaseapp.com",

    databaseURL:
        "https://smart-dispenser-b4450-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId:
        "smart-dispenser-b4450",

    storageBucket:
        "smart-dispenser-b4450.firebasestorage.app",

    messagingSenderId:
        "1075653503034",

    appId:
        "1:1075653503034:web:88370909f2535e8ffcad03",

    measurementId:
        "G-PS737QN390"
};


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

firebase.initializeApp(firebaseConfig);

const auth =
    firebase.auth();

const database =
    firebase.database();


// ============================================================
// DATABASE PATH
// ============================================================

const dispenserRef =
    database.ref("dispenser");


// ============================================================
// DOM — LOGIN PAGE
// ============================================================

const loginPage =
    document.getElementById("loginPage");

const dashboardPage =
    document.getElementById("dashboardPage");

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("emailInput");

const passwordInput =
    document.getElementById("passwordInput");

const loginButton =
    document.getElementById("loginButton");

const loginButtonText =
    document.getElementById("loginButtonText");

const loginError =
    document.getElementById("loginError");

const togglePassword =
    document.getElementById("togglePassword");

const logoutButton =
    document.getElementById("logoutButton");


// ============================================================
// DOM — CONNECTION / SYSTEM STATUS
// ============================================================

const firebaseStatus =
    document.getElementById("firebaseStatus");

const firebaseStatusDot =
    document.getElementById("firebaseDot");

const dataStatus =
    document.getElementById("dataStatus");

const dataStatusDot =
    document.getElementById("dataDot");

const sensorStatus =
    document.getElementById("sensorStatus");

const sensorStatusDot =
    document.getElementById("sensorDot");

const lastUpdate =
    document.getElementById("lastUpdate");

const sidebarConnectionText =
    document.getElementById("sidebarConnectionText");

const sidebarConnectionDot =
    document.getElementById("sidebarConnectionDot");


// ============================================================
// OPTIONAL DOM ELEMENTS
// ============================================================

const liveDot =
    document.getElementById("liveDot");

const liveText =
    document.getElementById("liveText");

const footerYear =
    document.getElementById("footerYear");


// ============================================================
// DASHBOARD STATE
// ============================================================

let dashboardInitialized =
    false;


// ============================================================
// HELPER — SAFE ELEMENT CHECK
// ============================================================

function elementExists(element) {

    return (
        element !== null &&
        element !== undefined
    );

}


// ============================================================
// SHOW LOGIN PAGE
// ============================================================

function showLogin() {

    if (elementExists(loginPage)) {

        loginPage.classList.remove(
            "hidden"
        );

    }


    if (elementExists(dashboardPage)) {

        dashboardPage.classList.add(
            "hidden"
        );

    }

}


// ============================================================
// SHOW DASHBOARD PAGE
// ============================================================

function showDashboard() {

    if (elementExists(loginPage)) {

        loginPage.classList.add(
            "hidden"
        );

    }


    if (elementExists(dashboardPage)) {

        dashboardPage.classList.remove(
            "hidden"
        );

    }

}


// ============================================================
// SHOW LOGIN ERROR
// ============================================================

function showLoginError(message) {

    if (!elementExists(loginError)) {

        return;

    }


    loginError.textContent =
        message;

    loginError.classList.remove(
        "hidden"
    );

}


// ============================================================
// HIDE LOGIN ERROR
// ============================================================

function hideLoginError() {

    if (!elementExists(loginError)) {

        return;

    }


    loginError.classList.add(
        "hidden"
    );

    loginError.textContent =
        "";

}


// ============================================================
// STATUS DOT
// ============================================================

function setStatusDot(
    element,
    status
) {

    if (!elementExists(element)) {

        return;

    }


    element.classList.remove(
        "online",
        "offline",
        "waiting"
    );


    element.classList.add(
        status
    );

}


// ============================================================
// LOGIN
// ============================================================

if (elementExists(loginForm)) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            hideLoginError();


            // ------------------------------------------------
            // CHECK INPUT ELEMENT
            // ------------------------------------------------

            if (
                !elementExists(emailInput) ||
                !elementExists(passwordInput)
            ) {

                console.error(
                    "Login input tidak ditemukan."
                );


                showLoginError(
                    "Form login bermasalah. Periksa ID email/password pada HTML."
                );


                return;

            }


            // ------------------------------------------------
            // GET INPUT
            // ------------------------------------------------

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (
                !email ||
                !password
            ) {

                showLoginError(
                    "Email dan password wajib diisi."
                );


                return;

            }


            // ------------------------------------------------
            // DISABLE LOGIN BUTTON
            // ------------------------------------------------

            if (elementExists(loginButton)) {

                loginButton.disabled =
                    true;

            }


            if (elementExists(loginButtonText)) {

                loginButtonText.textContent =
                    "Sedang masuk...";

            }


            // ------------------------------------------------
            // FIREBASE AUTH LOGIN
            // ------------------------------------------------

            try {

                await auth.signInWithEmailAndPassword(
                    email,
                    password
                );


                console.log(
                    "Firebase Login Berhasil:",
                    email
                );

            }


            catch (error) {

                console.error(
                    "Firebase Login Error:",
                    error
                );


                let message =
                    "Login gagal. Periksa email dan password.";


                switch (error.code) {

                    case "auth/invalid-email":

                        message =
                            "Format email tidak valid.";

                        break;


                    case "auth/user-not-found":

                        message =
                            "Akun Firebase tidak ditemukan.";

                        break;


                    case "auth/wrong-password":

                        message =
                            "Password yang dimasukkan salah.";

                        break;


                    case "auth/invalid-credential":

                        message =
                            "Email atau password salah.";

                        break;


                    case "auth/too-many-requests":

                        message =
                            "Terlalu banyak percobaan login. Coba lagi nanti.";

                        break;


                    case "auth/user-disabled":

                        message =
                            "Akun Firebase ini telah dinonaktifkan.";

                        break;


                    case "auth/network-request-failed":

                        message =
                            "Koneksi internet bermasalah.";

                        break;


                    case "auth/operation-not-allowed":

                        message =
                            "Login Email/Password belum diaktifkan di Firebase Authentication.";

                        break;


                    case "auth/api-key-not-valid":

                        message =
                            "Firebase API Key tidak valid.";

                        break;


                    default:

                        if (error.message) {

                            console.error(
                                "Detail Firebase:",
                                error.message
                            );

                        }

                        break;

                }


                showLoginError(
                    message
                );

            }


            finally {

                if (elementExists(loginButton)) {

                    loginButton.disabled =
                        false;

                }


                if (elementExists(loginButtonText)) {

                    loginButtonText.textContent =
                        "Login Dashboard";

                }

            }

        }
    );

}


// ============================================================
// SHOW / HIDE PASSWORD
// ============================================================

if (
    elementExists(togglePassword) &&
    elementExists(passwordInput)
) {

    togglePassword.addEventListener(
        "click",
        function() {

            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type =
                    "text";


                togglePassword.textContent =
                    "🙈";

            }

            else {

                passwordInput.type =
                    "password";


                togglePassword.textContent =
                    "👁";

            }

        }
    );

}


// ============================================================
// LOGOUT
// ============================================================

if (elementExists(logoutButton)) {

    logoutButton.addEventListener(
        "click",
        async function() {

            try {

                await auth.signOut();


                console.log(
                    "Firebase Logout Berhasil."
                );

            }


            catch (error) {

                console.error(
                    "Logout Error:",
                    error
                );

            }

        }
    );

}


// ============================================================
// AUTH STATE
// ============================================================

auth.onAuthStateChanged(
    function(user) {

        if (user) {

            console.log(
                "Firebase Authenticated:",
                user.email
            );


            showDashboard();


            /*
             * Dashboard akan diinisialisasi
             * pada Part 2.
             */

        }

        else {

            console.log(
                "Firebase: Not Authenticated"
            );


            showLogin();


            dashboardInitialized =
                false;

        }

    }
);


// ============================================================
// FIREBASE CONNECTION MONITOR
// ============================================================

function monitorFirebaseConnection() {

    const connectionRef =
        database.ref(
            ".info/connected"
        );


    connectionRef.on(
        "value",
        function(snapshot) {

            const connected =
                snapshot.val() === true;


            // =================================================
            // CONNECTED
            // =================================================

            if (connected) {

                if (
                    elementExists(
                        firebaseStatus
                    )
                ) {

                    firebaseStatus.textContent =
                        "Connected";

                }


                if (
                    elementExists(
                        sidebarConnectionText
                    )
                ) {

                    sidebarConnectionText.textContent =
                        "Connected";

                }


                if (
                    elementExists(
                        liveText
                    )
                ) {

                    liveText.textContent =
                        "Live";

                }


                setStatusDot(
                    firebaseStatusDot,
                    "online"
                );


                setStatusDot(
                    sidebarConnectionDot,
                    "online"
                );


                if (
                    elementExists(
                        liveDot
                    )
                ) {

                    liveDot.classList.add(
                        "online"
                    );

                }

            }


            // =================================================
            // DISCONNECTED
            // =================================================

            else {

                if (
                    elementExists(
                        firebaseStatus
                    )
                ) {

                    firebaseStatus.textContent =
                        "Disconnected";

                }


                if (
                    elementExists(
                        sidebarConnectionText
                    )
                ) {

                    sidebarConnectionText.textContent =
                        "Disconnected";

                }


                if (
                    elementExists(
                        liveText
                    )
                ) {

                    liveText.textContent =
                        "Offline";

                }


                setStatusDot(
                    firebaseStatusDot,
                    "offline"
                );


                setStatusDot(
                    sidebarConnectionDot,
                    "offline"
                );


                if (
                    elementExists(
                        liveDot
                    )
                ) {

                    liveDot.classList.remove(
                        "online"
                    );

                }

            }

        }
    );

}


// ============================================================
// START FIREBASE CONNECTION MONITOR
// ============================================================

monitorFirebaseConnection();


// ============================================================
// FOOTER YEAR
// ============================================================

if (elementExists(footerYear)) {

    footerYear.textContent =
        new Date().getFullYear();

}


// ============================================================
// DOM — DASHBOARD DATA
// ============================================================

const galonStatus =
    document.getElementById("galonStatus");

const galonDescription =
    document.getElementById("galonDescription");

const totalWater =
    document.getElementById("totalUsage");

const coldTemperature =
    document.getElementById("coldTemp");

const hotTemperature =
    document.getElementById("hotTemp");

const detailGalon =
    document.getElementById("detailGalon");

const detailCold =
    document.getElementById("detailCold");

const detailHot =
    document.getElementById("detailHot");

const detailWater =
    document.getElementById("detailUsage");


// ============================================================
// INITIALIZE DASHBOARD
// ============================================================

function initializeDashboard() {

    if (dashboardInitialized) {

        return;

    }


    dashboardInitialized =
        true;


    console.log(
        "Initializing Smart Public Dispenser Dashboard..."
    );


    monitorDispenser();

}


// ============================================================
// REALTIME DISPENSER MONITOR
// ============================================================

function monitorDispenser() {

    /*
     * Membaca seluruh data dari:
     *
     * /dispenser
     *
     * Firebase akan mengirim data secara realtime
     * setiap kali ada perubahan.
     */


    dispenserRef.on(

        "value",

        function(snapshot) {

            // =================================================
            // NO DATA
            // =================================================

            if (!snapshot.exists()) {

                console.warn(
                    "Path /dispenser tidak ditemukan."
                );


                setDataStatus(
                    "No Data",
                    "waiting"
                );


                setSensorStatus(
                    "Waiting",
                    "waiting"
                );


                if (
                    elementExists(liveText)
                ) {

                    liveText.textContent =
                        "No Data";

                }


                return;

            }


            // =================================================
            // GET FIREBASE DATA
            // =================================================

            const data =
                snapshot.val();


            console.log(
                "Firebase /dispenser:",
                data
            );


            // =================================================
            // UPDATE DASHBOARD
            // =================================================

            updateDashboard(
                data
            );


            // =================================================
            // DATA STATUS
            // =================================================

            setDataStatus(
                "Receiving Data",
                "online"
            );


            // =================================================
            // SENSOR STATUS
            // =================================================

            setSensorStatus(
                "Active",
                "online"
            );


            // =================================================
            // LIVE STATUS
            // =================================================

            if (
                elementExists(liveText)
            ) {

                liveText.textContent =
                    "Live";

            }


            // =================================================
            // LAST UPDATE
            // =================================================

            updateLastUpdateTime();

        },


        function(error) {

            console.error(
                "Firebase Database Read Error:",
                error
            );


            // ===============================================
            // DATA ERROR
            // ===============================================

            setDataStatus(
                "Read Error",
                "offline"
            );


            // ===============================================
            // SENSOR ERROR
            // ===============================================

            setSensorStatus(
                "Unavailable",
                "offline"
            );


            // ===============================================
            // LIVE ERROR
            // ===============================================

            if (
                elementExists(liveText)
            ) {

                liveText.textContent =
                    "Database Error";

            }

        }

    );

}


// ============================================================
// DATA STATUS
// ============================================================

function setDataStatus(
    text,
    status
) {

    if (
        elementExists(dataStatus)
    ) {

        dataStatus.textContent =
            text;

    }


    setStatusDot(
        dataStatusDot,
        status
    );

}


// ============================================================
// SENSOR STATUS
// ============================================================

function setSensorStatus(
    text,
    status
) {

    if (
        elementExists(sensorStatus)
    ) {

        sensorStatus.textContent =
            text;

    }


    setStatusDot(
        sensorStatusDot,
        status
    );

}


// ============================================================
// LAST UPDATE TIME
// ============================================================

function updateLastUpdateTime() {

    if (
        !elementExists(lastUpdate)
    ) {

        return;

    }


    const now =
        new Date();


    lastUpdate.textContent =
        now.toLocaleTimeString(
            "id-ID",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

}


// ============================================================
// UPDATE DASHBOARD
// ============================================================

function updateDashboard(data) {

    /*
     * Struktur data yang digunakan:
     *
     * dispenser
     * ├── statusGalon
     * ├── suhuDingin
     * ├── suhuPanas
     * └── totalPenggunaanAir
     */


    if (
        !data ||
        typeof data !== "object"
    ) {

        console.warn(
            "Data dispenser tidak valid:",
            data
        );


        return;

    }


    // ========================================================
    // STATUS GALON
    // ========================================================

    updateGalonStatus(
        data.statusGalon
    );


    // ========================================================
    // SUHU DINGIN
    // ========================================================

    updateColdTemperature(
        data.suhuDingin
    );


    // ========================================================
    // SUHU PANAS
    // ========================================================

    updateHotTemperature(
        data.suhuPanas
    );


    // ========================================================
    // TOTAL PENGGUNAAN AIR
    // ========================================================

    updateWaterUsage(
        data.totalPenggunaanAir
    );

}


// ============================================================
// UPDATE GALON STATUS
// ============================================================

function updateGalonStatus(
    value
) {

    const statusGalon =
        Number(value);


    // ========================================================
    // GALON TERSEDIA
    // ========================================================

    if (
        statusGalon === 1
    ) {

        if (
            elementExists(galonStatus)
        ) {

            galonStatus.textContent =
                "Tersedia";

        }


        if (
            elementExists(galonDescription)
        ) {

            galonDescription.textContent =
                "Galon tersedia dan dapat digunakan";

        }


        if (
            elementExists(detailGalon)
        ) {

            detailGalon.textContent =
                "1";

        }


        return;

    }


    // ========================================================
    // GALON HABIS
    // ========================================================

    if (
        statusGalon === 0
    ) {

        if (
            elementExists(galonStatus)
        ) {

            galonStatus.textContent =
                "Habis";

        }


        if (
            elementExists(galonDescription)
        ) {

            galonDescription.textContent =
                "Air galon habis";

        }


        if (
            elementExists(detailGalon)
        ) {

            detailGalon.textContent =
                "0";

        }


        return;

    }


    // ========================================================
    // UNKNOWN
    // ========================================================

    if (
        elementExists(galonStatus)
    ) {

        galonStatus.textContent =
            "Unknown";

    }


    if (
        elementExists(galonDescription)
    ) {

        galonDescription.textContent =
            "Status galon tidak diketahui";

    }


    if (
        elementExists(detailGalon)
    ) {

        detailGalon.textContent =
            "—";

    }

}


// ============================================================
// UPDATE COLD TEMPERATURE
// ============================================================

function updateColdTemperature(
    value
) {

    const cold =
        Number(value);


    if (
        Number.isFinite(cold)
    ) {

        if (
            elementExists(coldTemperature)
        ) {

            coldTemperature.textContent =
                cold.toFixed(1);

        }


        if (
            elementExists(detailCold)
        ) {

            detailCold.textContent =
                cold.toFixed(1) +
                " °C";

        }


        return;

    }


    // ========================================================
    // INVALID / EMPTY VALUE
    // ========================================================

    if (
        elementExists(coldTemperature)
    ) {

        coldTemperature.textContent =
            "--";

    }


    if (
        elementExists(detailCold)
    ) {

        detailCold.textContent =
            "—";

    }

}


// ============================================================
// UPDATE HOT TEMPERATURE
// ============================================================

function updateHotTemperature(
    value
) {

    const hot =
        Number(value);


    if (
        Number.isFinite(hot)
    ) {

        if (
            elementExists(hotTemperature)
        ) {

            hotTemperature.textContent =
                hot.toFixed(1);

        }


        if (
            elementExists(detailHot)
        ) {

            detailHot.textContent =
                hot.toFixed(1) +
                " °C";

        }


        return;

    }


    // ========================================================
    // INVALID / EMPTY VALUE
    // ========================================================

    if (
        elementExists(hotTemperature)
    ) {

        hotTemperature.textContent =
            "--";

    }


    if (
        elementExists(detailHot)
    ) {

        detailHot.textContent =
            "—";

    }

}


// ============================================================
// UPDATE WATER USAGE
// ============================================================

function updateWaterUsage(
    value
) {

    const water =
        Number(value);


    if (
        Number.isFinite(water)
    ) {

        if (
            elementExists(totalWater)
        ) {

            totalWater.textContent =
                water.toFixed(2);

        }


        if (
            elementExists(detailWater)
        ) {

            detailWater.textContent =
                water.toFixed(2) +
                " L";

        }


        return;

    }


    // ========================================================
    // INVALID / EMPTY VALUE
    // ========================================================

    if (
        elementExists(totalWater)
    ) {

        totalWater.textContent =
            "0.00";

    }


    if (
        elementExists(detailWater)
    ) {

        detailWater.textContent =
            "—";

    }

}


// ============================================================
// DASHBOARD STARTUP
// ============================================================
//
// Auth sudah berhasil pada Part 1.
// Setelah user login, fungsi ini akan dipanggil.
//
// Kita panggil monitor Firebase di sini agar database
// hanya dibaca ketika dashboard memang digunakan.
// ============================================================

auth.onAuthStateChanged(
    function(user) {

        if (!user) {

            return;

        }


        showDashboard();


        initializeDashboard();

    }
);


// ============================================================
// CHART STATE
// ============================================================

let temperatureChart =
    null;


const chartLabels =
    [];


const coldData =
    [];


const hotData =
    [];


const MAX_POINTS =
    30;


// ============================================================
// INITIALIZE TEMPERATURE CHART
// ============================================================

function initializeChart() {

    const canvas =
        document.getElementById(
            "temperatureChart"
        );


    if (!canvas) {

        console.warn(
            "Canvas #temperatureChart tidak ditemukan."
        );

        return;

    }


    // ========================================================
    // CEK CHART.JS
    // ========================================================

    if (
        typeof Chart ===
        "undefined"
    ) {

        console.error(
            "Chart.js belum dimuat."
        );

        return;

    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    if (!ctx) {

        console.error(
            "Canvas context tidak tersedia."
        );

        return;

    }


    // ========================================================
    // HINDARI CHART GANDA
    // ========================================================

    if (
        temperatureChart
    ) {

        try {

            temperatureChart.destroy();

        }

        catch (error) {

            console.warn(
                "Gagal destroy chart lama:",
                error
            );

        }


        temperatureChart =
            null;

    }


    // ========================================================
    // CREATE CHART
    // ========================================================

    temperatureChart =
        new Chart(
            ctx,
            {

                type:
                    "line",


                data: {

                    labels:
                        chartLabels,


                    datasets: [

                        // ====================================
                        // SUHU DINGIN
                        // ====================================

                        {

                            label:
                                "Suhu Dingin",

                            data:
                                coldData,

                            borderWidth:
                                2,

                            pointRadius:
                                2,

                            pointHoverRadius:
                                5,

                            tension:
                                0.35,

                            fill:
                                false

                        },


                        // ====================================
                        // SUHU PANAS
                        // ====================================

                        {

                            label:
                                "Suhu Panas",

                            data:
                                hotData,

                            borderWidth:
                                2,

                            pointRadius:
                                2,

                            pointHoverRadius:
                                5,

                            tension:
                                0.35,

                            fill:
                                false

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    interaction: {

                        intersect:
                            false,

                        mode:
                            "index"

                    },


                    plugins: {

                        legend: {

                            position:
                                "top",

                            align:
                                "end",


                            labels: {

                                usePointStyle:
                                    true,

                                boxWidth:
                                    7,

                                padding:
                                    15,


                                font: {

                                    family:
                                        "Inter",

                                    size:
                                        10

                                }

                            }

                        },


                        tooltip: {

                            backgroundColor:
                                "#111827",

                            padding:
                                10,


                            titleFont: {

                                size:
                                    11

                            },


                            bodyFont: {

                                size:
                                    11

                            },


                            callbacks: {

                                label:
                                    function(context) {

                                        const value =
                                            context.parsed.y;


                                        if (
                                            value ===
                                            null ||
                                            value ===
                                            undefined
                                        ) {

                                            return (
                                                context.dataset.label +
                                                ": —"
                                            );

                                        }


                                        return (
                                            context.dataset.label +
                                            ": " +
                                            Number(value).toFixed(1) +
                                            " °C"
                                        );

                                    }

                            }

                        }

                    },


                    scales: {

                        // ====================================
                        // X AXIS
                        // ====================================

                        x: {

                            grid: {

                                display:
                                    false

                            },


                            ticks: {

                                font: {

                                    family:
                                        "Inter",

                                    size:
                                        9

                                },


                                color:
                                    "#9ca3af"

                            }

                        },


                        // ====================================
                        // Y AXIS
                        // ====================================

                        y: {

                            beginAtZero:
                                false,


                            grid: {

                                color:
                                    "#f1f5f9"

                            },


                            ticks: {

                                font: {

                                    family:
                                        "Inter",

                                    size:
                                        9

                                },


                                color:
                                    "#9ca3af",


                                callback:
                                    function(value) {

                                        return (
                                            value +
                                            " °C"
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );


    console.log(
        "Temperature chart initialized."
    );

}


// ============================================================
// UPDATE TEMPERATURE CHART
// ============================================================

function updateTemperatureChart(
    cold,
    hot
) {

    // ========================================================
    // CHART BELUM TERSEDIA
    // ========================================================

    if (
        !temperatureChart
    ) {

        return;

    }


    // ========================================================
    // TIDAK ADA DATA VALID
    // ========================================================

    if (
        !Number.isFinite(cold) &&
        !Number.isFinite(hot)
    ) {

        return;

    }


    // ========================================================
    // CURRENT TIME
    // ========================================================

    const now =
        new Date();


    const time =
        now.toLocaleTimeString(
            "id-ID",
            {
                hour:
                    "2-digit",

                minute:
                    "2-digit",

                second:
                    "2-digit"
            }
        );


    // ========================================================
    // ADD LABEL
    // ========================================================

    chartLabels.push(
        time
    );


    // ========================================================
    // ADD COLD DATA
    // ========================================================

    coldData.push(

        Number.isFinite(cold)
            ? cold
            : null

    );


    // ========================================================
    // ADD HOT DATA
    // ========================================================

    hotData.push(

        Number.isFinite(hot)
            ? hot
            : null

    );


    // ========================================================
    // LIMIT DATA POINTS
    // ========================================================

    while (
        chartLabels.length >
        MAX_POINTS
    ) {

        chartLabels.shift();

        coldData.shift();

        hotData.shift();

    }


    // ========================================================
    // UPDATE CHART
    // ========================================================

    temperatureChart.update(
        "none"
    );

}


// ============================================================
// CLEAR TEMPERATURE CHART
// ============================================================

function clearTemperatureChart() {

    chartLabels.length =
        0;


    coldData.length =
        0;


    hotData.length =
        0;


    if (
        temperatureChart
    ) {

        temperatureChart.update(
            "none"
        );

    }

}
