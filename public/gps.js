/*
    This file contains the configuration file for firebase authentication.
    Putting in the configuration file, firebase app is initialized.
    After app initialization, firestore databases are loaded with specific
    settings. This firebase app is used globally in the entire application.
*/

const firebaseConfig = {
    apiKey: "AIzaSyBw6BFQF87kCuwfAXi6J93d5R6PAGPEO2Q",
    authDomain: "higps-ec870.firebaseapp.com",
    databaseURL: "https://higps-ec870-default-rtdb.firebaseio.com",
    projectId: "higps-ec870",
    storageBucket: "higps-ec870.appspot.com",
    messagingSenderId: "660587256313",
    appId: "1:660587256313:web:7e490305c235ea846c0528",
    measurementId: "G-V2BE3G4DHR"
};

// Initialize Firebase
window.haha = window.firebase.initializeApp(firebaseConfig);
const firestore = window.firebase.firestore();
const settings = {
    timestampsInSnapshots: true,
    merge: true
};
firestore.settings(settings);

export default window.firebase;

export {
    firestore,
};