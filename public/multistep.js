var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab
var selAssetGrab = document.getElementById('selAsset');
var inputAssetTypeGrab = document.getElementById('inputAssetType');

var assetArr = []; //holds option in AssetType select

function showTab(n) {
  // This function will display the specified tab of the form ...
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";
  // ... and fix the Previous/Next buttons:
  if (n == 0) {
    document.getElementById("cancelBtn").style.display = "none";
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("cancelBtn").style.display = "inline";
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (n == (x.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Submit";
  } else {
    document.getElementById("nextBtn").innerHTML = "Next";
  }
  // ... and run a function that displays the correct step indicator:
  fixStepIndicator(n)
}

function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("tab");
  // Exit the function if any field in the current tab is invalid:
  if (n == 1 && !validateForm()) return false;
  // Hide the current tab:
  x[currentTab].style.display = "none";
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form... :
  if (currentTab >= x.length) {
    //...the form gets submitted:
    document.getElementById("regForm").submit();
    return false;
  }
  // Otherwise, display the correct tab:
  showTab(currentTab);
}

function validateForm() {
  // This function deals with validation of the form fields
  var x, y, i, valid = true;
  x = document.getElementsByClassName("tab");
  y = x[currentTab].getElementsByTagName("input");
  // A loop that checks every input field in the current tab:
  for (i = 0; i < y.length; i++) {
    // If a field is empty...
    if (y[i].value == "") {
      // add an "invalid" class to the field:
      y[i].className += " invalid";
      // and set the current valid status to false:
      valid = false;
    }
  }
  // If the valid status is true, mark the step as finished and valid:
  if (valid) {
    document.getElementsByClassName("step")[currentTab].className += " finish";
  }
  return valid; // return the valid status
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  var i, x = document.getElementsByClassName("step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  //... and adds the "active" class to the current step:
  x[n].className += " active";
}

function GetSerialNumber(asset){
  alert (asset)

  var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       // Typical action to be performed when the document is ready:
       console.log(xhttp.responseText);
       document.getElementById("serialInpt").value = parseInt(JSON.parse(xhttp.responseText).done) + 1;
    }
};
xhttp.open("GET", "./serial?selAssType="+selAssetGrab.value, true);
xhttp.send();
  //xmlHttpRequestObj.send('')
}

function checkSelectOptions(inpt){
  alert ('checking...');
 filterCheckSelectOptions(inpt)
//  console.log(optionThing);
  // console.log(assetArr);
}

// function filterCheckSelectOptions(inpt){
//   console.log(inpt);
//   return [...selAssetGrab.options].filter(option=>{
//     console.log(option.innerText);
//     //console.log(option.innerText.includes(inpt));
//     return option.innerText.includes(inpt);
//     //assetArr.push(option.innerText);
//   });
// }

function filterCheckSelectOptions(inpt){
  console.log(inpt);
  
   for (var a=0; a < selAssetGrab.options.length;a++){
    if(selAssetGrab.options[a].innerText.includes(inpt)){
      console.log(selAssetGrab.options[a].innerText);
      selAssetGrab.size = 3;
      selAssetGrab.options.selectedIndex = a;
      return;
    }
  }
  
}


function SetAssetValue(this2){
  this2.size = 1;
  inputAssetTypeGrab.value = selAssetGrab.value;
}