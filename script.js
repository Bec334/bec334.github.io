//https://developer.nps.gov/api/v1/parks?api_key=GLqZF80GHtou5KMdYlMLC5eVwYLuggxOGc1YV4hG&stateCode=CA

//rjlAtlH8r9XuhToIzqu8hvoRkudDKiFg = giphy api key

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyCltjxm25DS6QUeJKJJTzCaN5SYpOQpQxg",
  authDomain: "spa-nps-prod.firebaseapp.com",
  databaseURL: "https://spa-nps-prod.firebaseio.com",
  projectId: "spa-nps-prod",
  storageBucket: "spa-nps-prod.appspot.com",
  messagingSenderId: "40388988937",
  appId: "1:40388988937:web:8bab7170e5a0f75a5be8d8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
let database = firebase.database();

//dom loaded event

window.addEventListener("DOMContentLoaded", event => {
  document.getElementById("states").addEventListener("click", function(e) {
    let selectedState = e.target.innerHTML;
    fetchStates(selectedState);

    document.querySelectorAll("button").forEach(elem => {
      elem.disabled = true;
    });
  });

  //get data from states.json file
  function fetchStates(state) {
    fetch("states.json")
      .then(response => response.json())
      .then(function(json) {
        getKeyByValue(json, state);
      });
  }

  //get the key of selected button
  function getKeyByValue(object, value) {
    let keyState = Object.keys(object).find(key => object[key] === value);
    console.log(keyState);
    callNPSApi(keyState);
  }

  //https://developer.nps.gov/api/v1/parks?api_key=GLqZF80GHtou5KMdYlMLC5eVwYLuggxOGc1YV4hG&stateCode=CA

  //make request to NPS API to list parks by state
  function callNPSApi(stateCode) {
    const endpointUrl =
      "https://developer.nps.gov/api/v1/parks?api_key=GLqZF80GHtou5KMdYlMLC5eVwYLuggxOGc1YV4hG&stateCode=";

    let queryEndpoint = endpointUrl + stateCode;
    console.log(queryEndpoint);
    fetch(queryEndpoint)
      .then(response => {
        return response.json();
      })
      .then(stateParksList => {
        parseParkData(stateParksList);
        hideStateButtons();
      });
  }

  //fade out the state button once the API request completes
  function hideStateButtons() {
    let stateButtons = document.getElementById("states").style; //.display = 'none';
    stateButtons.opacity = 1;
    (function fade() {
      (stateButtons.opacity -= 0.1) < 0
        ? (stateButtons.display = "none")
        : setTimeout(fade, 60);
    })();

    //hide the username and email input fields
    document.getElementById("help").style.display = "none";
    document.getElementById("req-list").style.display = "none";

  }

  function parseParkData(stateParkData) {
    let dataObj = stateParkData.data;

    console.log(dataObj);
    dataObj.forEach(function(state) {
      //    console.log(state);
      let name = state.fullName;
      let designation = state.designation;
      let description = state.description;

   //   get images of parks
      let imageEndpoint = "https://api.pexels.com/v1/search?per_page=1&query=";
      let apiKey = "563492ad6f91700001000001fe6e7efca4e841b7850d9da2587c42f8";
      let getImage = imageEndpoint + name;

      fetch(getImage, {
        headers: {
          authorization: apiKey
        }
      })
        .then(response => {
          return response.json();
        })
        .then(imageUrls => {
          let eachImage = imageUrls["photos"][0]["src"]["medium"];

          buildUiElements(name, description, designation, eachImage);
        });
    });
  }

  function buildUiElements(name, designation, description, image) {
    // create article elements
    let cardEl = document.createElement("div");
    cardEl.className = "card-body";
    cardEl.innerHTML = `
    <div class="card">
    <img class="card-img-top" src="${image}" alt="Card image cap">
    <div class="card-body">
      <h5 class="card-title" id="${name}">${name}</h5>
      <p class="card-text">${description}</p>
      <p class="card-text"><small class="text-muted">${designation}</small></p>
    <button type="button" class="btn btn-secondary btn-sm" value="${name}" id="card-button">I've been here</button>
    </div>
  </div>
	`;
    document.querySelector(".card-group").appendChild(cardEl);
  }

  document.getElementById("submit").addEventListener("click", function(event) {
    let userName = document.getElementById("username").value;
    let userEmail = document.getElementById("email").value;
    let userID = userName + "123";
    event.preventDefault();
    console.log(userID, userEmail, userName);

    // writeUserData(userName, userEmail);
  });

  //create/lookup/update uder data in firebase & store details

  // function writeUserData(userName, userEmail) {
  //   database.ref("users").set({
  //     username: userName,
  //     email: userEmail
  //   });
  //   console.log("firebase");
  // };

  //read firebase data about user

  var ref = firebase.database().ref("users");

  ref.on("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childData = childSnapshot.val();
      var id = childData.id;
      console.log(childData);
    });
  });

  //add an event delegation for the dynamically created cards
  // document.addEventListener("click", function(e) {
  //   if (e.target && e.target.id == "card-button") {
  //     console.log("clicked");

  //     let NPSname = e.target.value;
  //     console.log(e.target.value);
  //     saveNPSdata(NPSname);
  //   }
  // });

  // function saveNPSdata(NPSname) {
  //   firebase
  //     .database()
  //     .ref()
  //     .child("users/park/")
  //     .push({ park: NPSname });
  // }
  // database.ref("users/park").set({
  //   park: NPSname
  // });
  // console.log("firebase");

  //add click event listener to need help button to display form
  document
    .getElementById("help-button")
    .addEventListener("click", function(event) {
      document.getElementById("help-form").style.display = "block";
    });

  //get support form data and create ticket
  document
    .getElementById("help-submit")
    .addEventListener("click", function(event) {
      event.preventDefault();
      let ticketEmail = document.getElementById("inputEmail").value;
      let ticketName = document.getElementById("inputName").value;
      let ticketSubject = document.getElementById("inputSubject").value;
      let ticketCommmet = document.getElementById("inputDescription").value;

      createTicket(ticketEmail, ticketName, ticketSubject, ticketCommmet);
    });

  //look up existing ticket from the user
  document
    .getElementById("lookup-button")
    .addEventListener("click", function(event) {
      event.preventDefault();
      document.querySelector(".card").innerHTML = " ";

      lookupTickets();
    });

  //create ticket
  //https://developer.zendesk.com/rest_api/docs/support/requests#create-request

  const zendeskAPI =
    "https://z3nrebecca1578572730.zendesk.com/api/v2/requests.json";

  function createTicket(ticketEmail, ticketName, ticketSubject, ticketCommmet) {
    let ticketPayload = {
      request: {
        requester: {
          email: ticketEmail,
          name: ticketName
        },
        subject: ticketSubject,
        comment: {
          body: ticketCommmet
        }
      }
    };

    fetch(zendeskAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(ticketPayload)
    })
      .then(function(data) {
        console.log("Request success: ", data);
        document.getElementById("help-form").style.display = "none";
        document.querySelector(".card").innerHTML = " ";
        lookupTickets();
      })
      .catch(function(error) {
        console.log("Request failure: ", error);
        console.log(data);
      });
  }

  //LOOK UP tickets
  function lookupTickets() {
    let oauthBearer =
      "Bearer 5a5346ef08152aa605c64b6050b88ded6f76555fe9507cc13dc298e67fc40e6f";

    fetch(zendeskAPI, {
      headers: {
        authorization: oauthBearer
      }
    })
      .then(response => {
        return response.json();
      })
      .then(obj => {
        //  console.log(obj);
        let obj2 = obj.requests;
        console.log(obj2);

        obj2.forEach(function(arrayItem) {
          let subjectReq = arrayItem.subject;
          let descriptionReq = arrayItem.description;
          let idReq = arrayItem.id;
          buildRequestUiElements(subjectReq, descriptionReq, idReq);
        });
      });
  }

  //create ticket list UI
  function buildRequestUiElements(subjectReq, descriptionReq, idReq) {
    let requestEl = document.createElement("div");
    requestEl.className = "card";
    requestEl.innerHTML = `

  <div class="card-header">
 Ticket # ${idReq} Subject: ${subjectReq}
  </div>
  <div class="card-body">
  <p>Description: ${descriptionReq}</p>
  <button type="button" id='update-btn' value="${idReq}" class="btn btn-outline-secondary">Update Request</button>
  <button type="button" id='delete-btn' value="${idReq}" class="btn btn-outline-danger">Delete Ticket ${idReq} </button>
    <form>
  <div class="form-group">
  <label for="exampleFormControlTextarea1">Update the Request</label>
  <textarea class="form-control" placeholder='Add Comment' id="updateRequest" rows="2"></textarea>
</div>
</form>
  </div>
`;
    console.log(requestEl);
    document.querySelector(".card").appendChild(requestEl);
  }

  //UPDATE Ticket on button click
  document.addEventListener("click", function(e) {
    if (e.target && e.target.id == "update-btn") {
      let reqID = document.getElementById("update-btn").value;
      let ticketCommmet = document.getElementById("updateRequest").value;

      const updateUrl =
        "https://z3nrebecca1578572730.zendesk.com/api/v2/requests/";
      let oauthBearer =
        "Bearer 5a5346ef08152aa605c64b6050b88ded6f76555fe9507cc13dc298e67fc40e6f";

      let updatePayload = {
        request: {
          comment: {
            body: ticketCommmet
          }
        }
      };

      fetch(updateUrl + reqID + ".json", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: oauthBearer
        },
        body: JSON.stringify(updatePayload)
      })
        .then(response => {
          return response;
        })
        .then(data => {
          console.log(data);
          document.getElementById("updateRequest").value = "";
          document.getElementById("updateRequest").placeholder = "Submitted";
        });
    }
  });

  //DELETE Ticket on button click
  document.addEventListener("click", function(e) {
    if (e.target && e.target.id == "delete-btn") {
      let reqID = document.getElementById("delete-btn").value;
      const deleteUrl =
        "https://z3nrebecca1578572730.zendesk.com/api/v2/tickets/";
      let oauthBearer =
        "Bearer 5a5346ef08152aa605c64b6050b88ded6f76555fe9507cc13dc298e67fc40e6f";

      fetch(deleteUrl + reqID + ".json", {
        method: "delete",
        headers: {
          authorization: oauthBearer
        }
      })
        .then(response => {
          return response;
        })
        .then(data => {
          console.log(data);
          document.querySelector(".card").innerHTML = " ";
          lookupTickets();
        });
    }
  });

  //event listener closer
});
