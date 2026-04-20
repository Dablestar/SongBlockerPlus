var filePath = "./banList.txt";
var backgroundURL;
let banList;

function addBackgroundOnBanList(URL, id){
    console.log("addBackgroundOnBanList()" + URL + " " + id);
}

document.getElementById("addBtn").addEventListener("click", function() {
    console.log("btnClicked");
    addBackgroundOnBanList(backgroundURL, "testID");
});

    




