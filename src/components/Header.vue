<template>
  <div>
    <div class="topnav vertical-align-middle" id="myTopnav">
      <a href="#" class="menu-icon pd-lg-txt">
        <div class="text-align-left">
          <div
            class="w3-sidebar w3-bar-block w3-border-right"
            style="display: none"
            id="mySidebar"
          >
            <a href="#"
              ><img
                src="./../assets/userIcon.png"
                height="25px"
                width="25px"
              /><span> junaid</span></a
            >
            <button v-on:click="w3_close()" class="w3-bar-item w3-large">
              Close &times;
            </button>
            <button
              class="w3-button w3-block w3-left-align"
              v-on:click="openSubAccordionMenu('meanuAccordion0')"
            >
              Videos <i class="fa fa-caret-right"></i>
            </button>
            <div id="meanuAccordion0" class="w3-hide w3-white w3-card">
              <a href="#" class="w3-bar-item w3-button"
                ><router-link to="/" class="">Video Analysis</router-link></a
              >
              <a href="#" class="w3-bar-item w3-button"
                ><router-link to="/upload" class=""
                  >Upload New Video</router-link
                ></a
              >
              <a
                href="#"
                class="w3-bar-item w3-button"
                v-on:click="openModalVideoList()"
                >All Videos</a
              >
            </div>
            <button
              class="w3-button w3-block w3-left-align"
              v-on:click="openSubAccordionMenu('meanuAccordion1')"
            >
              Annotations <i class="fa fa-caret-right"></i>
            </button>
            <div id="meanuAccordion1" class="w3-hide w3-white w3-card">
              <a href="#" class="w3-bar-item w3-button" v-on:click="openModal()"
                >Annotation Items</a
              >
              <a href="#" class="w3-bar-item w3-button"
                >Annotation Categories</a
              >
            </div>
            <a href="#" class="w3-bar-item w3-button">Setting</a>
            <a href="#" class="w3-bar-item w3-button">Help</a>
          </div>
          <button class="w3-button w3-xlarge" v-on:click="w3_open()">☰</button>
        </div>
      </a>
      <a href="#" class="logo-icon"
        ><img
          class="tibava-logo"
          src="./../assets/tib_tibava_logo_5.png"
          alt="TIB-AV-A"
      /></a>
      <a href="#" class="logo-text"
        ><h2 class="pd-lg-txt">TIB AV-Analytics</h2></a
      >
      <a href="javascript:void(0);" class="icon" v-on:click="navFunction()">
        <i class="fa fa-bars"></i>
      </a>
    </div>

    <div id="videoListModal" class="modal">
      <div class="modal-content-sm text-align-right">
        <span class="videoListModalClose list-item-pointer">&times;</span>
        <VideoList />
      </div>
    </div>
  </div>
</template>
<script>
//import axios from "axios";
import VideoList from "./VideoList";
export default {
  name: "HeaderView",
  components: {
    VideoList,
  },
  methods: {
    navFunction: function () {
      var x = document.getElementById("myTopnav");
      if (x.className === "topnav") {
        x.className += " responsive";
      } else {
        x.className = "topnav";
      }
    },
    onPlayTimeChange() {
      console.log("the time is anchor2: ");
      //console.log(e.target.currentTime);
    },
    openModalVideoList: function () {
      console.log("in openModalWithVideos");
      var modal = document.getElementById("videoListModal"); // old annotationTimelineModal
      modal.style.display = "block";
    },
    openModal() {
      var modal = document.getElementById("sidebarAnnotationItemsModal");
      modal.style.display = "block";
      this.$root.$refs.ShotBoundaryView.getAllAnnotationCategories("");
      document.getElementById(
        "dd_annotation_category_button_in_annotation"
      ).disabled = "";
    },
    w3_open() {
      document.getElementById("mySidebar").style.display = "block";
    },
    w3_close() {
      document.getElementById("mySidebar").style.display = "none";
    },
    openSubAccordionMenu(accordionId) {
      var x = document.getElementById(accordionId);
      if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
        x.previousElementSibling.className += " bg-cb-yl";
      } else {
        x.className = x.className.replace(" w3-show", "");
        x.previousElementSibling.className =
          x.previousElementSibling.className.replace(" bg-cb-yl", "");
      }
    },
  },
  mounted: function () {
    var modal = document.getElementById("videoListModal");
    var span = document.getElementsByClassName("videoListModalClose")[0];
    span.onclick = function () {
      modal.style.display = "none";
    };
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  },
};
</script>


<style>
@import "https://www.w3schools.com/w3css/4/w3.css";
@import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";

/* Add a black background color to the top navigation */
.topnav {
  background-color: #ddd;
  overflow: hidden;
}

/* Style the links inside the navigation bar */
.topnav a {
  float: left;
  display: block;
  color: black;
  text-align: center;
  text-decoration: none;
  font-size: 17px;
}
.vertical-align-middle {
  vertical-align: middle !important;
}
.topnav a .menu-icon {
  margin-top: 50px !important;
  width: 100px;
}
.topnav a .logo-icon {
  width: 100px;
}
.topnav a .logo-text {
  width: 200px;
}

/* Change the color of links on hover */
.topnav a:hover {
  background-color: #ddd;
  color: black;
}

/* Add an active class to highlight the current page */
.topnav a.active {
  background-color: #04aa6d;
  color: white;
}

/* Hide the link that should open and close the topnav on small screens */
.topnav .icon {
  display: none;
}
/* When the screen is less than 600 pixels wide, hide all links, except for the first one ("Home"). Show the link that contains should open and close the topnav (.icon) */
@media screen and (max-width: 600px) {
  .topnav a:not(:first-child) {
    display: none;
  }
  .topnav a.icon {
    float: right;
    display: block;
  }
}

/* The "responsive" class is added to the topnav with JavaScript when the user clicks on the icon. This class makes the topnav look good on small screens (display the links vertically instead of horizontally) */
@media screen and (max-width: 600px) {
  .topnav.responsive {
    position: relative;
  }
  .topnav.responsive a.icon {
    position: absolute;
    right: 0;
    top: 0;
  }
  .topnav.responsive a {
    float: none;
    display: block;
    text-align: left;
  }
}
</style>
