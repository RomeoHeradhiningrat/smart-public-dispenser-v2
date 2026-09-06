// ============================================================
// SMART PUBLIC DISPENSER
// app.js - FINAL
// Firebase Authentication + Realtime Database
// ============================================================


// ============================================================
// FIREBASE CONFIG
// JANGAN DIUBAH - CONFIG YANG SUDAH WORKING
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyBbCtWZDMtNB38YUfbWPSGe2FvSOvm1n8",
    authDomain: "smart-dispenser-b4450.firebaseapp.com",
    databaseURL: "https://smart-dispenser-b4450-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-dispenser-b4450",
    storageBucket: "smart-dispenser-b4450.firebasestorage.app",
    messagingSenderId: "1075653503034",
    appId: "1:1075653503034:web:88370909f2535e8ffcad03",
    measurementId: "G-PS737QN390"
};


// ============================================================
// FIREBASE INITIALIZATION
// ============================================================

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const database = firebase.database();


// ============================================================
// GLOBAL STATE
// ============================================================

let currentUser = null;

let registeredDevices = {};

let selectedDeviceId = null;

let deviceDataRef = null;
let connectedRef = null;

let deviceDataListener = null;
let connectedListener = null;

let temperatureChart = null;

let currentDeviceData = null;


// ============================================================
// CONSTANTS
// ============================================================

// Struktur data ESP32 yang sedang digunakan
const DISPENSER_DATA_PATH = "dispenser";

// Registry perangkat milik user
const USER_DEVICES_PATH = "users";


// ============================================================
// DOM HELPER
// ============================================================

function $(id) {
    return document.getElementById(id);
}


// ============================================================
// DOM ELEMENTS
// ============================================================

const loginPage = $("loginPage");
const dashboardPage = $("dashboardPage");

const loginForm = $("loginForm");
const emailInput = $("emailInput");
const passwordInput = $("passwordInput");

const togglePassword = $("togglePassword");

const loginButton = $("loginButton");
const loginButtonText = $("loginButtonText");
const loginError = $("loginError");

const logoutButton = $("logoutButton");

const addDeviceButton = $("addDeviceButton");
const addDeviceSidebarButton = $("addDeviceSidebarButton");
const addDeviceEmptyButton = $("addDeviceEmptyButton");

const deviceList = $("deviceList");

const deviceModal = $("deviceModal");
const closeDeviceModal = $("closeDeviceModal");
const cancelDeviceButton = $("cancelDeviceButton");

const deviceForm = $("deviceForm");
const deviceIdInput = $("deviceIdInput");
const deviceNameInput = $("deviceNameInput");

const deviceFormError = $("deviceFormError");
const saveDeviceButton = $("saveDeviceButton");

const noDeviceState = $("noDeviceState");
const deviceDashboard = $("deviceDashboard");

const selectedDeviceBadge = $("selectedDeviceBadge");
const selectedDeviceName = $("selectedDeviceName");

const galonStatus = $("galonStatus");
const galonIcon = $("galonIcon");
const galonDescription = $("galonDescription");

const totalUsage = $("totalUsage");
const coldTemp = $("coldTemp");
const hotTemp = $("hotTemp");

const firebaseDot = $("firebaseDot");
const firebaseStatus = $("firebaseStatus");

const dataDot = $("dataDot");
const dataStatus = $("dataStatus");
const dataPathText = $("dataPathText");

const sensorDot = $("sensorDot");
const sensorStatus = $("sensorStatus");

const lastUpdate = $("lastUpdate");

const detailGalon = $("detailGalon");
const detailCold = $("detailCold");
const detailHot = $("detailHot");
const detailUsage = $("detailUsage");

const databasePath = $("databasePath");

const sidebarConnectionDot = $("sidebarConnectionDot");
const sidebarConnectionText = $("sidebarConnectionText");

const liveDot = $("liveDot");
const liveText = $("liveText");

const footerYear = $("footerYear");


// ============================================================
// INITIAL UI
// ============================================================

function initializeUI() {

    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    showLoginPage();

    resetDashboardData();

}


// ============================================================
// PAGE STATE
// ============================================================

function showLoginPage() {

    if (loginPage) {
        loginPage.classList.remove("hidden");
    }

    if (dashboardPage) {
        dashboardPage.classList.add("hidden");
    }

}


function showDashboardPage() {

    if (loginPage) {
        loginPage.classList.add("hidden");
    }

    if (dashboardPage) {
        dashboardPage.classList.remove("hidden");
    }

}


// ============================================================
// LOGIN ERROR
// ============================================================

function showLoginError(message) {

    if (!loginError) {
        return;
    }

    loginError.textContent = message;
    loginError.classList.add("show");

}


function hideLoginError() {

    if (!loginError) {
        return;
    }

    loginError.textContent = "";
    loginError.classList.remove("show");

}


// ============================================================
// DEVICE FORM ERROR
// ============================================================

function showDeviceFormError(message) {

    if (!deviceFormError) {
        return;
    }

    deviceFormError.textContent = message;
    deviceFormError.classList.remove("hidden");

}


function hideDeviceFormError() {

    if (!deviceFormError) {
        return;
    }

    deviceFormError.textContent = "";
    deviceFormError.classList.add("hidden");

}


// ============================================================
// PASSWORD TOGGLE
// ============================================================

function handlePasswordToggle() {

    if (!passwordInput) {
        return;
    }

    const isPassword =
        passwordInput.type === "password";

    passwordInput.type =
        isPassword ? "text" : "password";

    if (togglePassword) {
        togglePassword.textContent =
            isPassword ? "🙈" : "👁";
    }

}


// ============================================================
// LOGIN
// ============================================================

async function handleLogin(event) {

    event.preventDefault();

    hideLoginError();

    const email =
        emailInput ? emailInput.value.trim() : "";

    const password =
        passwordInput ? passwordInput.value : "";

    if (!email || !password) {

        showLoginError(
            "Email dan password wajib diisi."
        );

        return;
    }


    setLoginLoading(true);


    try {

        await auth.signInWithEmailAndPassword(
            email,
            password
        );

    } catch (error) {

        console.error(
            "Firebase Login Error:",
            error
        );

        showLoginError(
            translateFirebaseAuthError(error)
        );

    } finally {

        setLoginLoading(false);

    }

}


// ============================================================
// LOGIN BUTTON LOADING
// ============================================================

function setLoginLoading(loading) {

    if (!loginButton) {
        return;
    }

    loginButton.disabled = loading;

    if (loginButtonText) {

        loginButtonText.textContent =
            loading
                ? "Memproses..."
                : "Login Dashboard";

    }

}


// ============================================================
// FIREBASE AUTH ERROR TRANSLATION
// ============================================================

function translateFirebaseAuthError(error) {

    if (!error) {
        return "Terjadi kesalahan saat login.";
    }

    switch (error.code) {

        case "auth/invalid-email":
            return "Format email tidak valid.";

        case "auth/user-not-found":
            return "Akun tidak ditemukan.";

        case "auth/wrong-password":
            return "Password salah.";

        case "auth/invalid-credential":
            return "Email atau password salah.";

        case "auth/too-many-requests":
            return "Terlalu banyak percobaan login. Coba lagi nanti.";

        case "auth/network-request-failed":
            return "Gagal terhubung ke Firebase.";

        case "auth/user-disabled":
            return "Akun ini telah dinonaktifkan.";

        default:
            return error.message ||
                "Login gagal. Silakan coba lagi.";

    }

}


// ============================================================
// LOGOUT
// ============================================================

async function handleLogout() {

    try {

        await auth.signOut();

    } catch (error) {

        console.error(
            "Logout Error:",
            error
        );

    }

}


// ============================================================
// AUTH STATE
// SATU-SATUNYA AUTH LISTENER
// ============================================================

auth.onAuthStateChanged(async (user) => {

    currentUser = user;

    if (user) {

        console.log(
            "Firebase Authenticated:",
            user.email
        );

        showDashboardPage();

        updateFirebaseConnectionUI(false);

        await loadUserDevices();

    } else {

        console.log(
            "Firebase User Signed Out"
        );

        cleanupDeviceListener();

        cleanupConnectionListener();

        registeredDevices = {};
        selectedDeviceId = null;
        currentDeviceData = null;

        renderDeviceList();

        resetDashboardData();

        showLoginPage();

    }

});


// ============================================================
// USER DEVICES
// ============================================================

function getUserDevicesRef() {

    if (!currentUser) {
        return null;
    }

    return database.ref(
        `${USER_DEVICES_PATH}/${currentUser.uid}/devices`
    );

}


// ============================================================
// LOAD REGISTERED DEVICES
// ============================================================

async function loadUserDevices() {

    if (!currentUser) {
        return;
    }

    try {

        const snapshot =
            await getUserDevicesRef().once("value");

        registeredDevices =
            snapshot.val() || {};

        renderDeviceList();


        const deviceIds =
            Object.keys(registeredDevices);


        if (deviceIds.length === 0) {

            selectedDeviceId = null;

            showNoDeviceState();

            cleanupDeviceListener();

            return;
        }


        // Coba pertahankan device aktif sebelumnya
        if (
            selectedDeviceId &&
            registeredDevices[selectedDeviceId]
        ) {

            selectDevice(
                selectedDeviceId
            );

            return;
        }


        // Jika belum ada device aktif,
        // pilih device pertama
        selectDevice(deviceIds[0]);


    } catch (error) {

        console.error(
            "Load User Devices Error:",
            error
        );

        registeredDevices = {};

        renderDeviceList();

        showNoDeviceState();

    }

}


// ============================================================
// SAVE DEVICE
// ============================================================

async function saveDevice(event) {

    event.preventDefault();

    hideDeviceFormError();


    if (!currentUser) {

        showDeviceFormError(
            "Sesi login tidak ditemukan. Silakan login kembali."
        );

        return;
    }


    let deviceId =
        deviceIdInput.value.trim();

    let deviceName =
        deviceNameInput.value.trim();


    // Normalisasi ID
    deviceId =
        deviceId
            .toUpperCase()
            .replace(/\s+/g, "");


    if (!deviceId) {

        showDeviceFormError(
            "ID perangkat wajib diisi."
        );

        return;
    }


    if (!deviceName) {

        showDeviceFormError(
            "Nama perangkat wajib diisi."
        );

        return;
    }


    // Hanya karakter aman untuk Firebase key
    if (/[.#$[\]/]/.test(deviceId)) {

        showDeviceFormError(
            "ID perangkat mengandung karakter yang tidak valid."
        );

        return;
    }


    // Cek duplicate
    if (registeredDevices[deviceId]) {

        showDeviceFormError(
            "Perangkat dengan ID tersebut sudah ditambahkan."
        );

        return;
    }


    setDeviceSaveLoading(true);


    try {

        const deviceRef =
            getUserDevicesRef().child(deviceId);


        const deviceObject = {

            id: deviceId,

            name: deviceName,

            createdAt:
                firebase.database.ServerValue.TIMESTAMP

        };


        await deviceRef.set(
            deviceObject
        );


        registeredDevices[deviceId] =
            deviceObject;


        renderDeviceList();

        closeDeviceModalUI();

        deviceIdInput.value = "";
        deviceNameInput.value = "";

        selectDevice(deviceId);


    } catch (error) {

        console.error(
            "Save Device Error:",
            error
        );

        showDeviceFormError(
            "Gagal menambahkan perangkat. Silakan coba lagi."
        );

    } finally {

        setDeviceSaveLoading(false);

    }

}


// ============================================================
// DEVICE SAVE LOADING
// ============================================================

function setDeviceSaveLoading(loading) {

    if (!saveDeviceButton) {
        return;
    }

    saveDeviceButton.disabled =
        loading;

    saveDeviceButton.textContent =
        loading
            ? "Menyimpan..."
            : "Tambahkan Perangkat";

}


// ============================================================
// DELETE DEVICE
// ============================================================

async function deleteDevice(deviceId) {

    if (!currentUser) {
        return;
    }

    if (!registeredDevices[deviceId]) {
        return;
    }


    const deviceName =
        registeredDevices[deviceId].name ||
        deviceId;


    const confirmed =
        window.confirm(
            `Hapus perangkat "${deviceName}" dari dashboard?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await getUserDevicesRef()
            .child(deviceId)
            .remove();


        delete registeredDevices[deviceId];


        const remainingIds =
            Object.keys(registeredDevices);


        if (selectedDeviceId === deviceId) {

            cleanupDeviceListener();

            if (remainingIds.length > 0) {

                selectedDeviceId =
                    remainingIds[0];

                selectDevice(
                    selectedDeviceId
                );

            } else {

                selectedDeviceId = null;

                renderDeviceList();

                showNoDeviceState();

                resetDashboardData();

            }

        } else {

            renderDeviceList();

        }


    } catch (error) {

        console.error(
            "Delete Device Error:",
            error
        );

        alert(
            "Gagal menghapus perangkat."
        );

    }

}


// ============================================================
// RENDER DEVICE LIST
// ============================================================

function renderDeviceList() {

    if (!deviceList) {
        return;
    }


    deviceList.innerHTML = "";


    const deviceIds =
        Object.keys(registeredDevices);


    if (deviceIds.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "device-empty";

        empty.textContent =
            "Belum ada perangkat";

        deviceList.appendChild(
            empty
        );

        return;
    }


    deviceIds.forEach((deviceId) => {

        const device =
            registeredDevices[deviceId];


        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "device-item";


        if (deviceId === selectedDeviceId) {

            button.classList.add(
                "active"
            );

        }


        const icon =
            document.createElement("div");

        icon.className =
            "device-item-icon";

        icon.textContent =
            "📡";


        const info =
            document.createElement("div");

        info.className =
            "device-item-info";


        const name =
            document.createElement("strong");

        name.textContent =
            device.name || deviceId;


        const id =
            document.createElement("small");

        id.textContent =
            deviceId;


        info.appendChild(name);
        info.appendChild(id);


        const status =
            document.createElement("span");

        status.className =
            "device-item-status";

        status.textContent =
            "●";


        button.appendChild(icon);
        button.appendChild(info);
        button.appendChild(status);


        button.addEventListener(
            "click",
            () => {
                selectDevice(deviceId);
            }
        );


        // Klik kanan untuk hapus perangkat
        button.addEventListener(
            "contextmenu",
            (event) => {

                event.preventDefault();

                deleteDevice(deviceId);

            }
        );


        deviceList.appendChild(
            button
        );

    });

}


// ============================================================
// SELECT DEVICE
// ============================================================

function selectDevice(deviceId) {

    if (!deviceId) {
        return;
    }


    if (!registeredDevices[deviceId]) {

        console.warn(
            "Device tidak terdaftar:",
            deviceId
        );

        return;
    }


    selectedDeviceId =
        deviceId;


    currentDeviceData =
        null;


    renderDeviceList();

    updateSelectedDeviceUI();

    showDeviceDashboard();

    resetDashboardData();

    setupDeviceListener();

}


// ============================================================
// SELECTED DEVICE UI
// ============================================================

function updateSelectedDeviceUI() {

    const device =
        registeredDevices[selectedDeviceId];


    if (!device) {

        if (selectedDeviceBadge) {
            selectedDeviceBadge.classList.add(
                "hidden"
            );
        }

        return;
    }


    if (selectedDeviceBadge) {

        selectedDeviceBadge.classList.remove(
            "hidden"
        );

    }


    if (selectedDeviceName) {

        selectedDeviceName.textContent =
            device.name || selectedDeviceId;

    }


    if (databasePath) {

        databasePath.textContent =
            "Firebase /dispenser";

    }

}


// ============================================================
// MODAL
// ============================================================

function openDeviceModal() {

    hideDeviceFormError();

    if (deviceModal) {

        deviceModal.classList.remove(
            "hidden"
        );

    }


    if (deviceIdInput) {

        deviceIdInput.focus();

    }

}


function closeDeviceModalUI() {

    hideDeviceFormError();

    if (deviceModal) {

        deviceModal.classList.add(
            "hidden"
        );

    }

}


function handleModalOutsideClick(event) {

    if (
        deviceModal &&
        event.target === deviceModal
    ) {

        closeDeviceModalUI();

    }

}


// ============================================================
// NO DEVICE / DEVICE DASHBOARD STATE
// ============================================================

function showNoDeviceState() {

    if (noDeviceState) {

        noDeviceState.classList.remove(
            "hidden"
        );

    }


    if (deviceDashboard) {

        deviceDashboard.classList.add(
            "hidden"
        );

    }


    if (selectedDeviceBadge) {

        selectedDeviceBadge.classList.add(
            "hidden"
        );

    }

}


function showDeviceDashboard() {

    if (noDeviceState) {

        noDeviceState.classList.add(
            "hidden"
        );

    }


    if (deviceDashboard) {

        deviceDashboard.classList.remove(
            "hidden"
        );

    }

}


// ============================================================
// DATABASE DEVICE LISTENER
// ============================================================

function setupDeviceListener() {

    cleanupDeviceListener();


    /*
     * Untuk struktur ESP32 yang sekarang:
     *
     * /dispenser
     *   ├── statusGalon
     *   ├── suhuDingin
     *   ├── suhuPanas
     *   └── totalPenggunaanAir
     *
     * Device registry hanya menentukan perangkat
     * mana yang ditampilkan pada dashboard.
     */

    deviceDataRef =
        database.ref(
            DISPENSER_DATA_PATH
        );


    deviceDataListener =
        (snapshot) => {

            handleDeviceData(
                snapshot
            );

        };


    deviceDataRef.on(
        "value",
        deviceDataListener,
        (error) => {

            console.error(
                "Firebase Device Data Error:",
                error
            );

            setDataStatus(
                false,
                "Error"
            );

        }
    );


    updateDataPathUI();

}


// ============================================================
// CLEANUP DEVICE LISTENER
// ============================================================

function cleanupDeviceListener() {

    if (
        deviceDataRef &&
        deviceDataListener
    ) {

        deviceDataRef.off(
            "value",
            deviceDataListener
        );

    }


    deviceDataRef = null;
    deviceDataListener = null;

}


// ============================================================
// HANDLE DEVICE DATA
// ============================================================

function handleDeviceData(snapshot) {

    const data =
        snapshot.val();


    if (!data) {

        currentDeviceData = null;

        setDataStatus(
            false,
            "No Data"
        );

        setSensorStatus(
            false,
            "Waiting..."
        );

        resetSensorValues();

        return;
    }


    currentDeviceData =
        data;


    setDataStatus(
        true,
        "Online"
    );


    updateDashboardValues(
        data
    );


    updateChart(
        data
    );


    updateLastUpdate(
        data
    );

}


// ============================================================
// UPDATE DASHBOARD VALUES
// ============================================================

function updateDashboardValues(data) {

    const galon =
        normalizeGalonStatus(
            data.statusGalon
        );


    const cold =
        toNumber(
            data.suhuDingin
        );


    const hot =
        toNumber(
            data.suhuPanas
        );


    const usage =
        toNumber(
            data.totalPenggunaanAir
        );


    // --------------------------------------------------------
    // GALON
    // --------------------------------------------------------

    if (galonStatus) {

        galonStatus.textContent =
            galon.label;

    }


    if (galonDescription) {

        galonDescription.textContent =
            galon.description;

    }


    if (galonIcon) {

        galonIcon.textContent =
            galon.icon;

        galonIcon.classList.remove(
            "blue",
            "green",
            "orange",
            "cyan"
        );

        galonIcon.classList.add(
            galon.colorClass
        );

    }


    // --------------------------------------------------------
    // TOTAL AIR
    // --------------------------------------------------------

    if (totalUsage) {

        totalUsage.textContent =
            formatNumber(
                usage,
                2
            );

    }


    // --------------------------------------------------------
    // SUHU DINGIN
    // --------------------------------------------------------

    if (coldTemp) {

        coldTemp.textContent =
            isValidNumber(cold)
                ? formatNumber(cold, 1)
                : "--";

    }


    // --------------------------------------------------------
    // SUHU PANAS
    // --------------------------------------------------------

    if (hotTemp) {

        hotTemp.textContent =
            isValidNumber(hot)
                ? formatNumber(hot, 1)
                : "--";

    }


    // --------------------------------------------------------
    // DETAIL DATA
    // --------------------------------------------------------

    if (detailGalon) {

        detailGalon.textContent =
            data.statusGalon ?? "—";

    }


    if (detailCold) {

        detailCold.textContent =
            isValidNumber(cold)
                ? `${formatNumber(cold, 1)} °C`
                : "—";

    }


    if (detailHot) {

        detailHot.textContent =
            isValidNumber(hot)
                ? `${formatNumber(hot, 1)} °C`
                : "—";

    }


    if (detailUsage) {

        detailUsage.textContent =
            isValidNumber(usage)
                ? `${formatNumber(usage, 2)} L`
                : "—";

    }


    setSensorStatus(
        isValidNumber(cold) ||
        isValidNumber(hot),
        (
            isValidNumber(cold) ||
            isValidNumber(hot)
        )
            ? "Active"
            : "Waiting..."
    );

}


// ============================================================
// RESET SENSOR VALUES
// ============================================================

function resetSensorValues() {

    if (galonStatus) {
        galonStatus.textContent =
            "Waiting...";
    }

    if (galonDescription) {
        galonDescription.textContent =
            "Menunggu data";
    }

    if (galonIcon) {
        galonIcon.textContent =
            "💧";
    }

    if (totalUsage) {
        totalUsage.textContent =
            "0.00";
    }

    if (coldTemp) {
        coldTemp.textContent =
            "--";
    }

    if (hotTemp) {
        hotTemp.textContent =
            "--";
    }

    if (detailGalon) {
        detailGalon.textContent =
            "—";
    }

    if (detailCold) {
        detailCold.textContent =
            "—";
    }

    if (detailHot) {
        detailHot.textContent =
            "—";
    }

    if (detailUsage) {
        detailUsage.textContent =
            "—";
    }

}


// ============================================================
// RESET ENTIRE DASHBOARD DATA
// ============================================================

function resetDashboardData() {

    resetSensorValues();


    if (dataPathText) {

        dataPathText.textContent =
            "Waiting...";

    }


    if (lastUpdate) {

        lastUpdate.textContent =
            "—";

    }


    setDataStatus(
        false,
        "Waiting..."
    );


    setSensorStatus(
        false,
        "Waiting..."
    );


    destroyTemperatureChart();

}


// ============================================================
// DATA PATH UI
// ============================================================

function updateDataPathUI() {

    if (dataPathText) {

        dataPathText.textContent =
            "/dispenser";

    }


    if (databasePath) {

        databasePath.textContent =
            "Firebase /dispenser";

    }

}


// ============================================================
// FIREBASE CONNECTION
// ============================================================

function setupConnectionListener() {

    cleanupConnectionListener();


    connectedRef =
        database.ref(
            ".info/connected"
        );


    connectedListener =
        (snapshot) => {

            const connected =
                snapshot.val() === true;


            updateFirebaseConnectionUI(
                connected
            );

        };


    connectedRef.on(
        "value",
        connectedListener
    );

}


// ============================================================
// CLEANUP CONNECTION LISTENER
// ============================================================

function cleanupConnectionListener() {

    if (
        connectedRef &&
        connectedListener
    ) {

        connectedRef.off(
            "value",
            connectedListener
        );

    }


    connectedRef = null;
    connectedListener = null;

}


// ============================================================
// FIREBASE CONNECTION UI
// ============================================================

function updateFirebaseConnectionUI(
    connected
) {

    if (firebaseDot) {

        firebaseDot.classList.remove(
            "online",
            "offline"
        );

        firebaseDot.classList.add(
            connected
                ? "online"
                : "offline"
        );

    }


    if (firebaseStatus) {

        firebaseStatus.textContent =
            connected
                ? "Connected"
                : "Offline";

    }


    if (sidebarConnectionDot) {

        sidebarConnectionDot.classList.remove(
            "online",
            "offline"
        );

        sidebarConnectionDot.classList.add(
            connected
                ? "online"
                : "offline"
        );

    }


    if (sidebarConnectionText) {

        sidebarConnectionText.textContent =
            connected
                ? "Connected"
                : "Offline";

    }


    if (liveDot) {

        liveDot.classList.toggle(
            "online",
            connected
        );

    }


    if (liveText) {

        liveText.textContent =
            connected
                ? "Live"
                : "Offline";

    }

}


// ============================================================
// DATA STATUS UI
// ============================================================

function setDataStatus(
    online,
    text
) {

    if (dataDot) {

        dataDot.classList.remove(
            "online",
            "offline"
        );

        dataDot.classList.add(
            online
                ? "online"
                : "offline"
        );

    }


    if (dataStatus) {

        dataStatus.textContent =
            text;

    }

}


// ============================================================
// SENSOR STATUS UI
// ============================================================

function setSensorStatus(
    online,
    text
) {

    if (sensorDot) {

        sensorDot.classList.remove(
            "online",
            "offline"
        );

        sensorDot.classList.add(
            online
                ? "online"
                : "offline"
        );

    }


    if (sensorStatus) {

        sensorStatus.textContent =
            text;

    }

}


// ============================================================
// LAST UPDATE
// ============================================================

function updateLastUpdate(data) {

    let timestamp = null;


    // Support beberapa kemungkinan nama timestamp
    if (data.timestamp) {

        timestamp =
            parseTimestamp(
                data.timestamp
            );

    } else if (data.lastUpdate) {

        timestamp =
            parseTimestamp(
                data.lastUpdate
            );

    } else if (data.updatedAt) {

        timestamp =
            parseTimestamp(
                data.updatedAt
            );

    }


    // Jika ESP32 belum mengirim timestamp,
    // gunakan waktu saat data diterima.
    if (!timestamp) {

        timestamp =
            new Date();

    }


    if (lastUpdate) {

        lastUpdate.textContent =
            formatDateTime(
                timestamp
            );

    }

}


// ============================================================
// TEMPERATURE CHART
// ============================================================

function initializeTemperatureChart() {

    const canvas =
        $("temperatureChart");


    if (!canvas) {
        return;
    }


    if (
        typeof Chart === "undefined"
    ) {

        console.warn(
            "Chart.js belum tersedia."
        );

        return;
    }


    if (temperatureChart) {
        return;
    }


    const context =
        canvas.getContext("2d");


    temperatureChart =
        new Chart(
            context,
            {
                type: "line",

                data: {
                    labels: [],

                    datasets: [

                        {
                            label: "Suhu Dingin",

                            data: [],

                            tension: 0.35,

                            borderWidth: 2,

                            pointRadius: 2,

                            fill: false
                        },

                        {
                            label: "Suhu Panas",

                            data: [],

                            tension: 0.35,

                            borderWidth: 2,

                            pointRadius: 2,

                            fill: false
                        }

                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    animation: false,

                    interaction: {
                        intersect: false,
                        mode: "index"
                    },

                    scales: {

                        x: {

                            ticks: {
                                maxTicksLimit: 8
                            }

                        },

                        y: {

                            beginAtZero: false,

                            title: {
                                display: true,
                                text: "°C"
                            }

                        }

                    },

                    plugins: {

                        legend: {
                            display: true
                        }

                    }

                }

            }
        );

}


// ============================================================
// UPDATE CHART
// ============================================================

function updateChart(data) {

    if (!temperatureChart) {

        initializeTemperatureChart();

    }


    if (!temperatureChart) {
        return;
    }


    const cold =
        toNumber(
            data.suhuDingin
        );

    const hot =
        toNumber(
            data.suhuPanas
        );


    if (
        !isValidNumber(cold) &&
        !isValidNumber(hot)
    ) {

        return;

    }


    const now =
        new Date();


    const label =
        formatChartTime(
            now
        );


    const chartData =
        temperatureChart.data;


    chartData.labels.push(
        label
    );


    chartData.datasets[0].data.push(
        isValidNumber(cold)
            ? cold
            : null
    );


    chartData.datasets[1].data.push(
        isValidNumber(hot)
            ? hot
            : null
    );


    // Simpan maksimal 30 titik
    const maxPoints = 30;


    while (
        chartData.labels.length >
        maxPoints
    ) {

        chartData.labels.shift();

        chartData.datasets.forEach(
            (dataset) => {
                dataset.data.shift();
            }
        );

    }


    temperatureChart.update(
        "none"
    );

}


// ============================================================
// DESTROY CHART
// ============================================================

function destroyTemperatureChart() {

    if (temperatureChart) {

        temperatureChart.destroy();

        temperatureChart = null;

    }

}


// ============================================================
// GALON STATUS NORMALIZER
// ============================================================

function normalizeGalonStatus(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return {

            label: "Unknown",

            description: "Menunggu status galon",

            icon: "💧",

            colorClass: "blue"

        };

    }


    const normalized =
        String(value)
            .trim()
            .toLowerCase();


    // Penuh
    if (
        normalized === "penuh" ||
        normalized === "full" ||
        normalized === "1" ||
        normalized === "true"
    ) {

        return {

            label: "Penuh",

            description:
                "Persediaan air tersedia",

            icon: "💧",

            colorClass: "green"

        };

    }


    // Kosong
    if (
        normalized === "kosong" ||
        normalized === "empty" ||
        normalized === "0" ||
        normalized === "false"
    ) {

        return {

            label: "Kosong",

            description:
                "Persediaan air perlu diisi",

            icon: "⚠️",

            colorClass: "orange"

        };

    }


    // Rendah
    if (
        normalized.includes("rendah") ||
        normalized.includes("low")
    ) {

        return {

            label: "Rendah",

            description:
                "Persediaan air mulai menipis",

            icon: "⚠️",

            colorClass: "orange"

        };

    }


    return {

        label: String(value),

        description:
            "Status galon dari perangkat",

        icon: "💧",

        colorClass: "blue"

    };

}


// ============================================================
// NUMBER HELPERS
// ============================================================

function toNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    const number =
        Number(
            String(value)
                .replace(",", ".")
        );


    return Number.isFinite(number)
        ? number
        : null;

}


function isValidNumber(value) {

    return (
        typeof value === "number" &&
        Number.isFinite(value)
    );

}


function formatNumber(
    value,
    decimals = 2
) {

    if (!isValidNumber(value)) {
        return "--";
    }


    return value.toFixed(
        decimals
    );

}


// ============================================================
// TIMESTAMP HELPERS
// ============================================================

function parseTimestamp(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return null;

    }


    // Firebase timestamp milliseconds
    if (
        typeof value === "number"
    ) {

        const date =
            new Date(value);

        return isNaN(
            date.getTime()
        )
            ? null
            : date;

    }


    const parsed =
        new Date(value);


    if (
        isNaN(
            parsed.getTime()
        )
    ) {

        return null;

    }


    return parsed;

}


// ============================================================
// DATE FORMAT
// ============================================================

function formatDateTime(date) {

    if (!date) {
        return "—";
    }


    return date.toLocaleString(
        "id-ID",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );

}


// ============================================================
// CHART TIME FORMAT
// ============================================================

function formatChartTime(date) {

    if (!date) {
        return "";
    }


    return date.toLocaleTimeString(
        "id-ID",
        {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );

}


// ============================================================
// EVENT LISTENERS
// ============================================================

// Login
if (loginForm) {

    loginForm.addEventListener(
        "submit",
        handleLogin
    );

}


// Password toggle
if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        handlePasswordToggle
    );

}


// Logout
if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        handleLogout
    );

}


// Add device buttons
if (addDeviceButton) {

    addDeviceButton.addEventListener(
        "click",
        openDeviceModal
    );

}


if (addDeviceSidebarButton) {

    addDeviceSidebarButton.addEventListener(
        "click",
        openDeviceModal
    );

}


if (addDeviceEmptyButton) {

    addDeviceEmptyButton.addEventListener(
        "click",
        openDeviceModal
    );

}


// Close modal
if (closeDeviceModal) {

    closeDeviceModal.addEventListener(
        "click",
        closeDeviceModalUI
    );

}


if (cancelDeviceButton) {

    cancelDeviceButton.addEventListener(
        "click",
        closeDeviceModalUI
    );

}


if (deviceModal) {

    deviceModal.addEventListener(
        "click",
        handleModalOutsideClick
    );

}


// Device form
if (deviceForm) {

    deviceForm.addEventListener(
        "submit",
        saveDevice
    );

}


// ============================================================
// SIDEBAR NAVIGATION
// ============================================================

document
    .querySelectorAll(".nav-item")
    .forEach((item) => {

        item.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".nav-item")
                    .forEach((nav) => {

                        nav.classList.remove(
                            "active"
                        );

                    });


                item.classList.add(
                    "active"
                );

            }
        );

    });


// ============================================================
// HASH NAVIGATION
// ============================================================

function handleHashNavigation() {

    const hash =
        window.location.hash;


    if (!hash) {
        return;
    }


    const target =
        document.querySelector(
            hash
        );


    if (target) {

        setTimeout(
            () => {

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            },
            50
        );

    }

}


window.addEventListener(
    "hashchange",
    handleHashNavigation
);


// ============================================================
// START FIREBASE CONNECTION MONITOR
// ============================================================

setupConnectionListener();


// ============================================================
// INITIALIZE UI
// ============================================================

initializeUI();


// ============================================================
// DEBUG INFO
// ============================================================

console.log(
    "============================================"
);

console.log(
    "SMART PUBLIC DISPENSER"
);

console.log(
    "app.js loaded successfully"
);

console.log(
    "Firebase Project:",
    firebaseConfig.projectId
);

console.log(
    "Database:",
    firebaseConfig.databaseURL
);

console.log(
    "============================================"
);