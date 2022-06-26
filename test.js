// fetch(jb)
// .then(data)
// 1. how to get cities array?
// 2. cities array = string -> how to make it readable as an array (so i can use PUSH)
let lsCities = JSON.parse(localStorage.getItem("city")); // string -> array
if (!lsCities) {
  lsCities = [];
}
lsCities.push(data); // lsCities = [{sg}, {jb}]
// 3. how to put back
localStorage.setItem("city", lsCities);

// LOCAL STORAGE
