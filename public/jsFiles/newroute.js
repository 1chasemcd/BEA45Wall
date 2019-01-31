window.addEventListener('orientationchange', function(event){ setTimeout(onChange, 200); });
window.addEventListener("load", function() {onLoad();}, false);

var topNav;
var canvas;
var img;
var pullup;
var inroute;
var form;
var lowDiv;
var wall;
var focused = false;
var digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function onLoad() {
  //Locate HTML elements
  topNav = document.getElementById("topnav");
  canvas = document.getElementById("viewcanvas");
  img = document.getElementById("img");
  pullup = document.getElementById("pullup");
  inroute = document.getElementById("inroute");
  form = document.getElementById("routeform");
  lowDiv = document.getElementById("bottom");

  canvas.width = window.innerWidth;
  canvas.height = window.innerWidth * (1200/900);
  wall = new Wall(canvas, img);

  canvas.addEventListener('click', function(event) {
    wall.update(event.pageX, event.pageY);
    wall.draw();
  });

  // Code for form submit
  form.onsubmit = function() {
    var name = form.elements["name"].value;
    var setter = form.elements["setter"].value;
    var grade = form.elements["grade"].value;

    if (name == "" || setter == "" || grade == "v" || grade == "" || wall.holds.length == 0) {
      return false;
    }

    database.ref("/routes").once("value").then( function(snapshot) {
      var i = 0;
      if (snapshot.numChildren() != 0) {
        snapshot.forEach(function(childSnapshot) {
          if (i == snapshot.numChildren() - 1) {
            writeRouteData(parseInt(childSnapshot.key) + 1, name, setter, grade);
          }
          i++;
        })
      } else {
        writeRouteData("0", name, setter, grade);
      }
    });

    // Return false to prevent the default form behavior
    return false;
  }

  onChange();

  setInterval(inputSafety, 100);
}

function onChange() {
  // Setup canvas
  canvas.style.marginTop = topNav.offsetHeight - 20 + "px";
  canvas.width = window.innerWidth;
  canvas.height = window.innerWidth * (1200/900);
  wall.changeCanvas(canvas);

  // Code for sticky bottom tab
  var stickyY = inroute.offsetTop - window.innerHeight;
  if (window.innerHeight > canvas.height + topNav.offsetHeight){
    pullup.classList.add("pullupmove");
    pullup.classList.remove("pullupfixed");
  } else {
    pullup.classList.remove("pullupmove");
    pullup.classList.add("pullupfixed");
  }
  window.onscroll = function() {
    if (window.pageYOffset > stickyY) {
      pullup.classList.add("pullupmove");
      pullup.classList.remove("pullupfixed");
    } else {
      pullup.classList.remove("pullupmove");
      pullup.classList.add("pullupfixed");
    }
  }

// Code for bottom spacefiller div
  if (window.innerHeight > canvas.height + topNav.offsetHeight){
    lowDiv.style.height = window.innerHeight -
    (inroute.offsetTop + inroute.offsetHeight) + "px";
  } else {
    lowDiv.style.height = "0px";
  }
}

function writeRouteData(index, name, setter, grade) {
  database.ref("routes/" + index).set({
    name: name,
    setter: setter,
    grade: grade
  }, function(error) {
    if (error) {
      document.write(error);
    } else {
      writeHoldData(index);
    }
  });
}

function writeHoldData(index) {
  database.ref("holds/" + index).set({
    list: wall.getHolds()
  }, function(error) {
    if (error) {
      document.write(error);
    } else {
      openIndex();
    }
  });
}

// Return to the main page.
function openIndex() {
  location.href='index.html';
}

// Slowly scroll to bottom on tab click.
function scrollToBottom() {
  window.scrollBy(0,10);
  if (window.pageYOffset < document.body.scrollHeight
    - window.innerHeight) {
    scrolldelay = setTimeout(scrollToBottom, 5);
  }
}

function inputSafety() {
  if (form.elements["name"].value.length > 20) {
    form.elements["name"].value = form.elements["name"].value.substring(0, 25);
  }

  if (form.elements["setter"].value.length > 20) {
    form.elements["setter"].value = form.elements["setter"].value.substring(0, 25);
  }

  if (focused && form.elements["grade"].value.length == 0) {
    form.elements["grade"].value = "v";
  }

  if (form.elements["grade"].value.length > 3) {
    form.elements["grade"].value = form.elements["grade"].value.substring(0, 3);
  }

  if (form.elements["grade"].value.length > 1 &&
      !digits.includes(form.elements["grade"].value[form.elements["grade"].value.length - 1])) {
    form.elements["grade"].value = form.elements["grade"].value.substring(0, form.elements["grade"].value.length - 1);
  }
}
