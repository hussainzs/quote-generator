/**
 * At the time of writing, the api being used is working. Each object returned contains three properties
 * 'text', 'author' and 'tag'
 */

/******************************************************************** */
/* Global Variables */
/******************************************************************** */

let apiQuotes = [];
let quote_container = document.getElementById("quote-container");
let quote = document.getElementById("quote");
let author = document.getElementById("author");
let loader = document.getElementById("loader");
const wrapper = document.querySelector(".wrapper");
let dropdownClicked_yet = false;
// filled by method return_categorizedArray() -> an array of objects relevant to the tagname
let categorized_aray = [];

/******************************************************************** */
/* Loading Spinner Functionality */
/******************************************************************** */

/**
 * Turn ON LOADER
 */
const showLoadingSpinner = () => {
  //make the loader visible (set display to block)
  loader.hidden = false;
  //make the quote container invisible (set display to none)
  wrapper.hidden = true;
};

/**
 * Turn OFF LOADER
 */
const removeLoadingSpinner = () => {
  //make the loader invisible
  loader.hidden = true;
  //make the quote container visible
  wrapper.hidden = false;
};

/******************************************************************** */
/* Fetch API */
/******************************************************************** */

async function getQuotes() {
  //run the loader
  showLoadingSpinner();

  // Store the api url to connect
  const apiUrl = "https://jacintodesign.github.io/quotes-api/data/quotes.json";
  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      apiQuotes = await response.json();
      //call the newQuotes function to display the first quote in default state
      newQuotes();
    } else {
      alert(
        "Error in Fetching API. Make Sure API is working and URL used is correct"
      );
      throw new Error("HTTP-Error: " + response.status);
    }
  } catch (err) {
    alert(
      "Error in Fetching API. Make Sure API is working and URL used is correct"
    );
  }
  return apiQuotes;
}

/******************************************************************** */
/* Next Quote Button Functionality */
/******************************************************************** */

// Show next Quote
newQuotes = () => {
  let random_quote =
    apiQuotes[Math.floor(Math.random() * apiQuotes.length - 1)];

  //IF author is not null (truthy) then assign its value to author ELSE asign "unknown"
  let author = random_quote.author ? random_quote.author : "Unknown";
  let quote_text = random_quote.text;

  //handle the case of long quotes
  check_quote_length(quote_text);
  //update DOM
  updateDOM_with_quote(quote_text, author);
};

/******************************************************************** */
/* DOM Updates */
/******************************************************************** */

/** Updates the DOM with text
 * @param {String} text
 * @param {String} author
 */
updateDOM_with_quote = (text, author_name) => {
  //run the loader
  showLoadingSpinner();

  // Update the inner text of the dom elements
  quote.innerText = text;
  author.innerText = author_name;

  //turn off loader
  removeLoadingSpinner();
};

/**
 * @param {String} quote_text
 */
check_quote_length = (quote_text) => {
  //add the css class to quote DOM element if quote is too long
  if (quote_text.length > 140) {
    quote.classList.add("long-quote-class");
  } else {
    quote.classList.remove("long-quote-class");
  }
};

/******************************************************************** */
/* Tweet Button Functionality */
/******************************************************************** */

// Tweet Button functionality
function tweetQuote() {
  // using template literal construct a dynamic twitter intent
  const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${
    quote.textContent
  } - ${
    author.textContent
  }${"%0D%0AVisit: "}&url=https%3A%2F%2Fwww.pennalpha.com`;
  //open the url in a new tab
  window.open(twitterIntentUrl, "_blank");
}

/******************************************************************** */
/* Event Listeners for Tweet Button and Next Button */
/******************************************************************** */

// Add event listener to listen for next quote button click
let tweet_btn = document.getElementById("twitter-btn");
tweet_btn.addEventListener("click", tweetQuote, false);

let next_btn = document.getElementById("next-quote");
next_btn.addEventListener("click", () => {
  // Value of dropdownClicked_yet is changed under the Tag Functionality when tag is clicked
  if (dropdownClicked_yet) {
    newQuotes_by_Tag();
  } else {
    newQuotes();
  }
});

/*************************     TAGS    ************************************* */

/* ********************************************************************/
/* Anaalyze Tag Data */
/**********************************************************************/

/**
 * Generates two arrays
 * 1- categories[] -> contains string names of all the tags
 * 2- array_of_categories[] -> contains array of obejcts related to each tag.
 * #Keep in mind that this data must be passed in from a async function that awaits for this data from getQuotes()
 * @param {Array} data - json data fetched
 * @returns {Array} [categories, array_of_categories]
 */
function generate_CategorizedArrays(data) {
  let array_of_categories = [];
  let categories = [];

  // Fill the first element of categories and array_of_categories
  categories.push(data[0].tag);
  let starting_arr = [data[0]];
  array_of_categories.push(starting_arr);

  //populate categorize array and array_of_catagories
  for (let i = 1; i < data.length; i++) {
    const obj = data[i];
    let index = 0;
    const tag_name = obj["tag"];

    // If tag_name has already been seen
    // then push this obj into the releveant existing array element in array_of_categories
    if (categories.includes(tag_name)) {
      index = categories.indexOf(tag_name);
      array_of_categories[index].push(obj);
    } else {
      // If its a new tag then create a new array and add this obj in that array and then add that array to
      // array_of_categories. Also push tag_name to the categories array so we can label it as seen.
      categories.push(tag_name);
      let nextArr = [];
      nextArr.push(obj);
      array_of_categories.push(nextArr);
    }
  }

  //Remove any data with empty tag name
  let bad_index = categories.indexOf("");
  if (bad_index !== null) {
    categories.splice(bad_index, bad_index);
    array_of_categories.splice(bad_index, bad_index);
  }

  //rerturn an array
  return [categories, array_of_categories];
}

/**
 * @param {Array} categories array of tag names
 * @param {Array} array_of_categories array of array of categories
 * @param {String} tagName name of the tag
 * @returns {Array} an array of objects relevant to the tagname
 */
function return_categorizedArray(categories, array_of_categories, tagName) {
  if (categories.includes(tagName)) {
    let which_index = categories.indexOf(tagName);

    //return statement
    return array_of_categories[which_index];
  } else {
    alert(`${tagName} Tag does not exist`);
  }
}

/******************************************************************** */
/* Tags Menu UI Functionality */
/******************************************************************** */

/**
 * Fills the dropdown menu with Tag names
 * @param {Array} categories array of tag names
 */

function create_dropdownMenu(categories) {
  categories.forEach((tag) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = tag;
    li.appendChild(a);
    dropdown.appendChild(li);
  });
}

// Get the dropdown menu and the tag-menu button
const dropdown = document.querySelector(".dropdown-menu");
const dropdownButton = document.querySelector(".tag-menu");

// Function to toggle the dropdown menu
// .toggle() will add 'show' class to dropdown-menu IF it wasnt there already.
//If the 'show' class was already tehre it will remove it.
const toggleDropdown = () => {
  dropdown.classList.toggle("show");
};

// Function to close the dropdown menu IF clicked outside the menu
const closeDropdown = (event) => {
  //if the click DID NOT happen on the dropdown button AND NEITHER on any of the dropdown list items
  //THEN remove the 'show' class from the dropdown to hide it/close it.
  if (
    !event.target.matches(".tag-menu a") &&
    !event.target.matches(".dropdown-menu *")
  ) {
    dropdown.classList.remove("show");
  }
};

//Add Event Listeners to the dropdownButton and Document body (to close the dropdown if the body is clicked)
dropdownButton.addEventListener("click", toggleDropdown);
document.addEventListener("click", closeDropdown);

/******************************************************************** */
/* Tags Runnable Functionality */
/******************************************************************** */

/**
 * If Tag is clicked it will start to show quotes relevenat to the tag
 * @param {Array} arr [categories, array_of_categories]
 */
function run_tag_functionality(arr) {
  const dropdown_list = document.querySelector("#dropdown");

  dropdown_list.addEventListener("click", (event) => {
    // make sure the click was on 'a' tag. Case insensitive
    if (event.target.tagName === "A") {
      // changing flag variable so the next quote button runs newQuotes_by_Tag() instead of newQuotes()
      dropdownClicked_yet = true;

      // Change the text on Tags button
      const button_text = document.querySelector(".tag-menu a");
      button_text.innerHTML = `${event.target.textContent} <i class="fa-solid fa-angle-down"></i>`;

      //categorized_array is a global variable
      categorized_aray = return_categorizedArray(
        arr[0],
        arr[1],
        event.target.textContent
      );
      //next quote button functionality now generates quotes relevenat to the tag clicked
      newQuotes_by_Tag();
    }
  });
}

newQuotes_by_Tag = () => {
  let random_quote =
    categorized_aray[Math.floor(Math.random() * categorized_aray.length - 1)];
  let author = random_quote.author ? random_quote.author : "Unknown";
  let quote_text = random_quote.text;

  //handle the case of long quotes
  check_quote_length(quote_text);
  //update DOM
  updateDOM_with_quote(quote_text, author);
};

/******************************************************************** */
/* Run The Page */
/******************************************************************** */
async function run() {
  // loads the page and starts the default functionality of random quotes
  getQuotes();

  // must use await here to recieve data. once data has been recieved you can padd this data as a parameter from this function only
  const data = await getQuotes();
  const arr = generate_CategorizedArrays(data);

  //   arr[0] = categories
  //   arr[1] = array_of_categories
  create_dropdownMenu(arr[0]);

  run_tag_functionality(arr);
}
//without this call program will not run
run();
