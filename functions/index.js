const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.helloWorld = functions.https.onRequest((request, response) => {
	response.send("Hello from Firebase!");
});

// Listen for changes in all documents in the 'users' collection
exports.copyLocationsData = functions.firestore
	.document('users/{userId}')
	.onUpdate(async (change, context) => {
		// If we set `/users/marie` to {name: "Marie"} then
		// context.params.userId == "marie"
		// ... and ...
		// change.after.data() == {name: "Marie"}

		const newStatus = change.after.data().status;
		const userDocId = context.params.userId;

		if(newStatus == 'Positive'){
			copyData(userDocId);
			console.log(`data copied for ` + userDocID);
		}
	});

// Test function => http://localhost:5001/covid-19-5a8e7/us-central1/testMe
exports.testMe = functions.https.onRequest(async (request, response) => {
	copyData("dp3wj6x1yvrn");
	response.send("end");
});


// Private method copyData
const copyData = async (userDocId) => {
	const toWait = [];

	// set copy function => copies data to locations collection
	const copyFunction = async (documentSnapshot) => {
		await console.log(`new doc found` + documentSnapshot.ref.path);
		let data = documentSnapshot.data();

		await admin.firestore().collection('locations').add({
			l: data.l,
			userDocId: data.userDocId,
			lastStatusUpdate: data.lastStatusUpdate
		});
	};

	// read doc from locationNeg collection
	const snapshots = await admin.firestore().collection('locationsNeg').where('userDocId', '==', userDocId).get();
	snapshots.forEach((documentSnapshot) => {
		toWait.push(copyFunction((documentSnapshot)));
	});

	await Promise.all(toWait);
};
