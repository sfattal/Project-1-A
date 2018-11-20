// Lennox code below!
// Initialize variables
var finalDiagnosis;
var results;
var formResults;
var ptAnswer;
var ptGender;
var ptAge;
var ptZip;
var questionCount = 0;
var newIssue;
var symptoms = {
    "text": null
}; 
var ptData = {
    "sex": null,
    "age": null,
    "evidence": [],
    "extras": {
        "disable_groups": true
    }
};

// Processes user input of symptoms
$("#enterSymptoms").on("click", function(){

    event.preventDefault();

    newIssue = $("#userSymptoms").val().trim();
    console.log(newIssue);

    sessionStorage.clear();
    sessionStorage.setItem("newIssue", newIssue);
    $("#userSymptoms").val("");
    $("#speech-bubble-two").text(newIssue);
    
});

// Assigns gender on patient entry
$("#female").on("click", function(){

    event.preventDefault();

    ptGender = "female";
    ptData['sex'] = ptGender;
});

$("#male").on("click", function(){

    event.preventDefault();

    ptGender = "male";
    ptData['sex'] = ptGender;
});

// Captures user age
$("#add-userdata-btn").on("click", function(){

    event.preventDefault();

    symptoms["text"] = sessionStorage.getItem("newIssue");
    console.log(symptoms["text"]);
    console.log("this is the symptom object", symptoms);

    ptAge = $("#age-input").val().trim();
    ptData['age'] = ptAge;
    ptZip = $("#zipcode-input").val().trim();
    sessionStorage.setItem("ptZip", ptZip);

    $.ajax({
        url: 'https://api.infermedica.com/v2/parse',
        headers: {
            'App-Key':'40e6e4c193572624b23c98565566e25f',
            'App-Id':'041cc529',
            'Content-Type':'application/json'
        },
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify(symptoms),
        success: function(answer){

            // Turns result into string
            results = JSON.stringify(answer);

            // Turns string into object to select from
            formResults = JSON.parse(results);
            console.log("triage results", formResults);

            // Loops through array of possible symptoms and adds them to evidence
            for (var i = 0; i < formResults.mentions.length; i++){
                if (formResults.mentions[i].choice_id === 'present'){
                   var newEvidence = {
                       "id": formResults.mentions[i].id,
                       "choice_id": "present"
                   };
                   ptData["evidence"].push(newEvidence); 
                   console.log(ptData);
                } else {
                    var newEvidence = {
                        "id": formResults.mentions[i].id,
                        "choice_id": "absent"
                    };
                }   ptData["evidence"].push(newEvidence);
            };
            triage(); 
        }
    });
})



function triage(){
    if (questionCount < 5){

        console.log("this is pt data", ptData);
        // Searches API for relation between symptoms
        $.ajax({
            url: 'https://api.infermedica.com/v2/diagnosis',
            headers: {
                'App-Key':'40e6e4c193572624b23c98565566e25f',
                'App-Id':'041cc529',
                'Content-Type':'application/json'
            },
            method: 'POST',
            dataType: 'json',
            data: JSON.stringify(ptData), // Should change to ptData variable
            success: function(answer){

                // Add 1 to question count
                questionCount++;

                // Turns result into string
                results = JSON.stringify(answer);
                console.log("string results", results);

                // Turns string into object to select from
                formResults = JSON.parse(results);
                console.log("object results", formResults);

                // Writes follow up question to screen
                $("#followup1-input").text(formResults.question.text);
                console.log("this is the question", formResults.question.text);
                console.log("this is the id", formResults.question.items[0].id);

                // Confirms that result is a string
                console.log(typeof formResults.question.items[0].id);
                console.log(ptData['evidence']);

                // Adds Yes or No buttons beneath question
                var yesButton = $("<button>");
                yesButton.text("Yes");
                yesButton.attr("id", "yesButton");
                yesButton.attr("data-name", "yes");
                var noButton = $("<button>");
                noButton.text("No");
                noButton.attr("id", "noButton");
                noButton.attr("data-name", "no");
                $("#followup1-input").append(yesButton); 
                $("#followup1-input").append(noButton);

                $("#yesButton").on("click", function(){

                    event.preventDefault();

                    ptAnswer = $(this).attr("data-name");
                    addSymptom();
                    console.log("this is the first pt answer", ptAnswer);
                });

                $("#noButton").on("click", function(){

                    event.preventDefault();

                    ptAnswer = $(this).attr("data-name");
                    addSymptom();
                    console.log(ptAnswer);
                });
                
            }
        });
    } else {

        // Save final diagnosis
        finalDiagnosis = formResults.conditions[0]["name"];
        console.log("this is the final diagnosis", finalDiagnosis);
        sessionStorage.setItem("diagnosis", finalDiagnosis);
        console.log(sessionStorage.getItem("diagnosis"));

        // Prompt user to view third page
        $("#followup1-input").text("Click 'Get Diagnosed' to view your assessment");
    }
};

// Adds new symptom to data array depending on pt answer
function addSymptom(){
    console.log("This is the pt answer", ptAnswer);
    if (ptAnswer === "yes"){
        var newSymptom = formResults.question.items[0].id
        console.log("this is the new symptom", newSymptom);
        var newEvidence = {
           "id": newSymptom,
           "choice_id": "present"
        };
        ptData["evidence"].push(newEvidence);
        console.log("this is the new evidence", newEvidence)
        triage();
    } else if (ptAnswer === 'no'){
        var newSymptom = formResults.question.items[0].id
        var newEvidence = {
            "id": newSymptom,
            "choice_id": "absent"
        };
        console.log("this is the no evidence", newEvidence);
        ptData["evidence"].push(newEvidence);
        triage();
    };
};

$(document).ready(function(){

    $("#displayDiagnosis").html("<h2>Well...it looks you might have: " + sessionStorage.getItem("diagnosis") + "</h2>");

// Sung's BetterDoctor begins here ----------------------------------

        var diagnosis = sessionStorage.getItem("diagnosis");
       
        $("#doc-button").on("click", function() {
           
            getLocation();

                function getLocation() {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(showPosition);
                    } else { 
                        alert("Geolocation is not supported by this browser!");
                    }
                }
   
                function showPosition(position) {

                    var userLat = position.coords.latitude;
                    var userLong = position.coords.longitude;
                    var queryURL = "https://api.betterdoctor.com/2016-03-01/doctors?query=" + diagnosis + "&location=40.730610,-73.935242,5&user_location=" + userLat + "," + userLong + "&skip=0&limit=5&user_key=9e72f5f3689906e7d41eb04c90ac91a3";
                    console.log(queryURL);
                    console.log(userLat);
                    console.log(userLong);

                $.ajax({
                    url: queryURL,
                    method: "GET"
                })

                .then(function(response) {
                    var doctors = response.data;
                        
                        // Profiles ---------------------------
                        function makeProfileHTML(profile) {
                            var profileDiv = $("<div>");

                                var docFirst = profile.first_name;
                                console.log(docFirst);
                                var docLast = profile.last_name;
                                console.log(docFirst);
                                var docImage = profile.image_url;
                                var nameSpan = $("<p>").text(docFirst + " " + docLast);
                                var image = $("<img>");
                                    image.attr('src', docImage);
                                    $(profileDiv).append(image);
                                    $(profileDiv).append(nameSpan);
                            
                            return profileDiv
                        }

                        // Practices ---------------------------
                        function makePracticesHTML(practices) {
                            
                            var practiceDiv = $("<div>");
                                var addressArr = [];
                                var cityArr = [];
                                var stateArr = [];
                                var zipArr = [];
                                var phoneArr = [];

                            for (var i = 0; i < practices.length; i++) {

                                    var chainDocPractices = practices[i];
                                    for (var cdp = 0; cdp < chainDocPractices.phones.length; cdp++) {
                                    
                                    addressArr.push(practices[i].visit_address.street);
                                    cityArr.push(practices[i].visit_address.city);
                                    stateArr.push(practices[i].visit_address.state);
                                    zipArr.push(practices[i].visit_address.zip);
                                    phoneArr.push(chainDocPractices.phones[cdp].number);
                                }
                            }
                                // we're adding [0] of each arrays to remove duplicates
                                var addressSpan = $("<span>").text("Address: " + addressArr[0] + ", " + cityArr[0] + ", " + stateArr[0] + " " + zipArr[0]).append("<br>");
                                var phoneSpan = $("<span>").text("Phone: " + phoneArr[0]).append("<br>");
                                    $(practiceDiv).append(addressSpan);
                                    $(practiceDiv).append(phoneSpan);

                            return practiceDiv
                        }

                        // Ratings ---------------------------
                        function makeRatingsHTML(ratings) {
                            
                            var ratingDiv = $("<div>");
                            var ratingArr = [];
                            var ratingProviderArr = [];

                            for (var i = 0; i < ratings.length; i++) {
                                ratingArr.push(ratings[i].rating);
                                ratingProviderArr.push(ratings[i].provider);
                            }

                            var ratingSpan = $("<p>").text("Rating: " + ratingArr[0]).append("<br>");
                            var ratingNo = $("<p>").text("Rating: " + "No Rating").append("<br>");
                            
                                if (ratingProviderArr[0] === "betterdoctor") {
                                        $(ratingDiv).append(ratingSpan);
                                    } else {
                                        $(ratingDiv).append(ratingNo);
                                    }

                            return ratingDiv
                        }

                        // Insurances ---------------------------
                        function makeInsurancesHTML(insurances) {

                            var insurancesDiv = $("<div>");
                            var insurancesArr = [];

                            for (var i = 0; i < insurances.length; i++) {
                                insurancesArr.push(insurances[i].insurance_plan.name);
                            }
                            
                            var uniqueInsurances = [];
                            $.each(insurancesArr, function(i, el){
                                if($.inArray(el, uniqueInsurances) === -1) uniqueInsurances.push(el);
                                });

                            for (var i = 0; i < uniqueInsurances.length; i++) {
                                var insuranceSpan = $("<span>").text(uniqueInsurances[i]).append("<br>");
                                $(insurancesDiv).append(insuranceSpan);
                            }

                            return insurancesDiv
                        }

                        // Specialties ---------------------------
                        function makeSpecialtiesHTML(specialties) {
                            var specialtiesDiv = $("<div>");
                            var specialtiesArr = [];

                            for (var i = 0; i < specialties.length; i++) {
                                specialtiesArr.push(specialties[i].name);
                            }

                                var specialtySpan = $("<span>").text("Specialty: " + specialtiesArr[0]);
                                $(specialtiesDiv).append(specialtySpan);

                            return specialtiesDiv
                        }

                        // Final Rendering ---------------------------
                        for (var i = 0; i < doctors.length; i++) {
                            var docDiv = $("<div>");
                            var profileHTML = makeProfileHTML(doctors[i].profile)
                            var practicesHTML = makePracticesHTML(doctors[i].practices);
                            var ratingsHTML = makeRatingsHTML(doctors[i].ratings);
                            var insuranceHTML = makeInsurancesHTML(doctors[i].insurances);
                            var specialtyHTML = makeSpecialtiesHTML(doctors[i].specialties);
                            
                            docDiv.append(profileHTML);
                            docDiv.append(practicesHTML);
                            docDiv.append(specialtyHTML);
                            docDiv.append(ratingsHTML);
                            docDiv.append(insuranceHTML);
                            $("#displayDoctors").append(docDiv);
                        }
        
                    });
            }

       });

});

