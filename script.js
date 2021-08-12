console.log('hello!');
var xml_data = null;
var objClass;
var elementName;
var attributeName;
var elementBase;
var baseAPIURL = 'https://api.insightly.com/v3.1/';
var APIConnected = false;

function init() {
  console.log('initializing');
  xml_file = document.getElementById('xml_file');
  key_button = document.getElementById('crm_key');
  file_display = document.getElementById('content');
  xml_file.addEventListener('change', showFile, false);
  key_button.addEventListener('change', getCRMData, false);
}

function getCRMData() {
  let key = key_button.value;
  console.log('sending request');
  $.ajax({
    type: 'GET',
    url: 'https://reqres.in/api/products/3', //baseAPIURL + 'CustomObjects',
    dataType: 'json',
    async: false,
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', 'Basic ' + btoa(key));
      xhr.setRequestHeader('Content-Type', 'application/json');
    },
    success: function(res) {
      console.log('done');
      apiOK(res);
    },
    error: function(jqxhr, status, exception) {
      console.log('Exception:', exception);
    }
  });
}

function apiOK(result) {
  APIConnected = true;
  console.log(result);
}

function showFile() {
  if (!xml_file.files[0]) return;
  console.log('doing it');
  const fr = new FileReader();
  fr.readAsText(xml_file.files[0]);
  fr.onload = function(e) {
    xml_data = e.target.result;
    file_display.innerHTML = makeTable();
    $('#data_table').ready(function() {
      console.log('coocoo');
      $('#data_table').tablesorter();
    });
  };
}

function getElements() {
  if (!xml_data) return null;
  xmlDoc = new DOMParser().parseFromString(xml_data, 'text/xml');
  objClass = xmlDoc.documentElement.nodeName;
  if (!objClass) return null;
  //Elementname is e.g. ORGANIZATION(S), CONTACT(S), but News__c für Custom Objects

  elementName =
    objClass.substr(objClass.length - 1).toUpperCase() == 'S'
      ? objClass.substr(0, objClass.length - 1)
      : objClass;
  elements = xmlDoc.getElementsByTagName(elementName);
  elementBase = objClass == elementName ? 1 : 0;
  attributeName = objClass == elementName ? 'RECORD_ID' : elementName + '_ID';
  return elements;
}

function getHeaders(elements) {
  //find out longest element first, computational expense not ideal, but well
  let lIndex = elementBase;
  let lValue = 0;
  for (let i = elementBase; i < elements.length; i++) {
    if (elements[i].childNodes.length <= lValue) continue;
    lIndex = i;
    lValue = elements[i].childNodes.length;
  }
  console.log(lIndex + ' / ' + lValue);
  let nameIndex = new Array();
  Array.from(elements[lIndex].childNodes).forEach(function(child) {
    nameIndex.push(child.nodeName);
  });
  console.log(nameIndex);
  return nameIndex;
}

function makeTable() {
  let elements = getElements();
  if (!elements) return 'no proper data';
  let retHTML = '<h2>' + objClass + '</h2>';
  retHTML += '<table id="data_table" class="tablesorter"><thead><tr>';
  retHTML += '<th>ID</th>';
  let nameIndex = getHeaders(elements);
  nameIndex.forEach(function(tag) {
    retHTML += '<th>' + tag + '</th>';
  });
  retHTML += '</thead></tr><tbody>';

  for (let i = elementBase; i < elements.length; i++) {
    retHTML += '<tr><td>' + elements[i].getAttribute(attributeName) + '</td>';
    nameIndex.forEach(function(tag) {
      let theNode = elements[i].getElementsByTagName(tag)[0];
      if (theNode) {
        retHTML += '<td>' + theNode.textContent + '</td>';
      } else {
        retHTML += '<td></td>';
      }
    });
    retHTML += '</tr>';
  }
  return retHTML + '</tbody></table>';
}
