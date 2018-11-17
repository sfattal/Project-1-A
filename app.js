// Lennox code below!
// Initialize variables
var diagnosis;
var results;
var formResults;
var ptAnswer;
var ptGender;
var ptAge;
var questionCount = 0;
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

// Captures user age
$("#age-input").val().trim() = ptAge;
ptData['age'] = ptAge;

// Assigns gender on patient entry
$("#female").on("click", function(){
    ptGender = "female";
    ptData['sex'] = ptGender;
});

$("#male").on("click", function(){
    ptGender = "male";
    ptData['sex'] = ptGender;
});

// Processes user input of symptoms
$("#enterSymptoms").on("click", function(){
    symptoms["text"] = $("#userSymptoms").val().trim();

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
            console.log(JSON.parse(results));

            // Loops through array of possible symptoms and adds them to evidence
            for (var i = 0; i < formResults.mentions.length; i++){
                if (formResults.mentions[i].choice_id === 'present'){
                   var newEvidence = {
                       "id": formResults.mentions[i].id,
                       "choice_id": "present"
                   };
                   ptData["evidence"].push(newEvidence); 
                   console.log(ptData);
                }
            };
            triage(); 
        }
    });
});

function triage(){
    if (questionCount < 5){
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

                // Turns string into object to select from
                formResults = JSON.parse(results);
                console.log(JSON.parse(results));

                // Writes follow up question to screen
                $("#followup1-input").text(formResults.question.text);
                console.log(formResults.question.items[0].id);

                // Confirms that result is a string
                console.log(typeof formResults.question.items[0].id);
                console.log(data['evidence']);

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
                    ptAnswer = $(this).attr("data-name");
                });

                $("#noButton").on("click", function(){
                    ptAnswer = $(this).attr("data-name");
                });
                addSymptom();
            }
        });
    } else {
        // Prompt user to view third page
        $("#followup1-input").text("Click 'Get Diagnosed' to view your assessment");

        // Displays final diagnosis on screen
        diagnosis = formResults.conditions[0]["name"];
        var diagnosisDisplay = $("<div>");
        diagnosisDisplay.attr("id", "diagnosis");
        diagnosisDisplay.text("Well...it looks you might have: " + diagnosis);
        $("#displayDiagnosis").append(diagnosisDisplay); // Need name of display div

    }
};

// Adds new symptom to data array depending on pt answer
function addSymptom(ptAnswer){
    if (ptAnswer === 'yes'){
        var newSymptom = formResults.question.items[0].id
        symptoms.push(newSymptom);
        var newEvidence = {
           "id": newSymptom,
           "choice_id": "present"
        };
        data["evidence"].push(newEvidence);
        triage();
    } else if (ptAnswer === 'no'){
        var newEvidence = {
            "id": newSymptom,
            "choice_id": "absent"
        };
        data["evidence"].push(newEvidence);
        triage();
    } else {
        var newEvidence = {
            "id": newSymptom,
            "choice_id": "unknown"
        };
        data["evidence"].push(newEvidence);
        triage();
    };
};



