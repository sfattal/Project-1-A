<<<<<<< HEAD

// 2. Button for adding symptoms
$("#add-symptom-btn").on("click", function(event) {
    event.preventDefault();
<<<<<<< HEAD
=======
  
lennox-branch
    // Grabs user input
    var symp1 = $("#symptom1-input").val().trim();
    var symp2 = $("#symptom2-input").val().trim();
    var symp3 = $("#symptom3-input").val().trim();});
   
 // Lennox code below!
 // Initialize variables
=======
// Lennox code below!
// Initialize variables
>>>>>>> 0ba6b60fc9326fb6aa6e82c4692a6f00d5f60d1a
var diagnosis;
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
        diagnosis = formResults.conditions[0]["name"];
        console.log("this is the final diagnosis", diagnosis);
        sessionStorage.setItem("diagnosis", diagnosis);
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
        var newEvidence = {
            "id": newSymptom,
            "choice_id": "absent"
        };
        ptData["evidence"].push(newEvidence);
        triage();
    };
};

<<<<<<< HEAD
>>>>>>> 6fb99b381bb7c60ea1fe147945fdc645dc3ba056
=======
$(document).ready(function(){
    $("#displayDiagnosis").text("Well...it looks you might have: " + sessionStorage.getItem("diagnosis"));
});
>>>>>>> 0ba6b60fc9326fb6aa6e82c4692a6f00d5f60d1a

    $(".form-group").append("<input/>")
    
})