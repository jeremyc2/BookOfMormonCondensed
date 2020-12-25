var i = 0,
    j = 0;

const urlParams = new URLSearchParams(window.location.search);

var content,
    prependContentButton,
    appendContentButton,
    modal,
    selected;

var promise;

function copy(text) {
    var input = document.createElement('textarea');
    input.innerHTML = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
}

function buildBookmarkURL(index) {
    return document.location.origin + document.location.pathname + `?index=${index}`
}

function bookmarkToClipboard() {

    copy(buildBookmarkURL(selected.id));
    hideModal();

}

function bookmarkToHistory() {
    window.history.pushState(null, null, `?index=${selected.id}`);
    hideModal();
}

function unwelcome() {
    document.getElementById("welcome").style.display = "none";
}

function showModal() {
    modal.style.display = "block";
    modal.classList.remove("hide");
    modal.classList.add("show");
}

function hideModal() {

    modal.classList.remove("show");

    // https://css-tricks.com/restart-css-animation/
    void modal.offsetWidth;
    
    modal.classList.add("hide");
}

function injectText(index, text) {
    if(content == null) return;

    console.log(`ITI: ${index}`);

    var span = document.createElement("span");
    span.addEventListener("dblclick", function(e) {
        window.getSelection().removeAllRanges();
        selected = e.target;
        selected.classList.add("selected");
    });

    span.addEventListener("animationend", function(e) {
        e.target.classList.remove("selected");
        showModal();
    });
 
    span.id = index;

    span.innerHTML = text;
    content.appendChild(span);
    i = j = index;
}

function prependText(index, text) {
    if(content == null) return;

    console.log(`PTI: ${index}`);

    var span = document.createElement("span");
    span.addEventListener("dblclick", function(e) {
        window.getSelection().removeAllRanges();
        selected = e.target;
        selected.classList.add("selected");
    });

    span.addEventListener("animationend", function(e) {
        e.target.classList.remove("selected");
        showModal();
    });

    span.id = index;

    span.innerHTML += text + " ";
    content.insertBefore(span,content.firstChild);

    if(index <= 0) {
        document.body.removeChild(prependContentButton);
    }

}

function appendText(index, text) {
    if(content == null) return;

    console.log(`ATI: ${index}`);

    var span = document.createElement("span");
    span.addEventListener("dblclick", function(e) {
        window.getSelection().removeAllRanges();
        selected = e.target;
        selected.classList.add("selected");
    });

    span.addEventListener("animationend", function(e) {
        e.target.classList.remove("selected");
        showModal();
    });

    span.id = index;

    span.innerHTML += " " + text;
    content.appendChild(span);
}

function isElementInViewport (el) {

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 50 &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function prependContent() {

    const prependMax = 10;
    for (var prependIndex = 0; prependIndex < prependMax; prependIndex++) {

        promise = promise
            .then(() => getPreviousSentence(j, prependText))
            .then(() => j--);
    }

}

function appendContent() {
    if(i >= 7624) {
        document.body.removeChild(appendContentButton);
        return;
    }

    if(isElementInViewport(appendContentButton)) {
        promise = promise
            .then(() => getNextSentence(i, appendText))
            .then(() => i++)
            .then(() => {
                if(isElementInViewport(appendContentButton)) {
                    appendContent();
                }
            });
    }
}

document.addEventListener('DOMContentLoaded', () => {

    content = document.getElementById("content");
    prependContentButton = document.getElementById("prepend-content-button");
    appendContentButton = document.getElementById("append-content-button");
    modal = document.getElementById("modal");

    modal.addEventListener("animationend", function(e) {
        if(e.target.classList.contains("hide")) {
            e.target.style.display = "none";
        }
    });

    document.getElementById("options").addEventListener("click", function(e) {e.stopPropagation()});

    modal.addEventListener("click", hideModal)

    if(urlParams.has("index")) {
        i = j = urlParams.get("index");

        if(i == 0) {
            document.body.removeChild(prependContentButton);
        }

        promise = getSentence(i, injectText);
    } else {
        document.body.removeChild(prependContentButton);
        promise = getFirstSentence(injectText);
    }

    if(urlParams.has("welcome")) {
        document.getElementById("welcome").style.display = "block";
    }

    appendContent();

    document.addEventListener('load', appendContent, false);
    document.addEventListener('scroll', appendContent, false);
    document.addEventListener('resize', appendContent, false);
}, false);