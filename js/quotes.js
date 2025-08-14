// sorbet.rip - random quotes for MOTD
// easily editable collection of internet humor

const MOTD_QUOTES = [
    "remember when the internet was good?",
    "tfw no gf posting never gets old",
    "sage goes in all fields",
    "newfags can't triforce",
    "op is a bundle of sticks as always",
    "checked and kekpilled",
    "digits confirm it",
    "autism speaks and it says buy crypto",
    "another day, another seethe thread",
    "imagine not using an imageboard in 2025",
    "this thread is now diamonds",
    "moot was right about everything",
    "feels good man dot jpeg",
    "based and anonymous-pilled",
    "lurk moar, post less",
    "the oldfags were right",
    "normalfags ruined the internet",
    "we're all gonna make it brah",
    "op can't into basic computer usage",
    "it's ogre",
    "the industrial revolution and its consequences...",
    "anon delivers once again",
    "rare pepe do not steal",
    "dubs and i do it",
    "pic unrelated but here's a cat",
    "tfw you realize you're the problem",
    "sage for great justice",
    "op is a faggot",
    "this is why we can't have nice things",
    "anon discovers the internet",
    "imagine being this new",
    "the prophecy was true",
    "we live in a society",
    "bottom text",
    "nobody expects the spanish inquisition",
    "op clearly doesn't know how to internet",
    "this thread is now about trains",
    "sage in all fields",
    "op is a bundle of sticks",
    "checked and kekpilled",
    "digits confirm it",
    "autism speaks and it says buy crypto",
    "another day, another seethe thread",
    "imagine not using an imageboard in 2025",
    "this thread is now diamonds",
    "moot was right about everything",
    "feels good man dot jpeg",
    "based and anonymous-pilled",
    "lurk moar, post less",
    "the oldfags were right",
    "normalfags ruined the internet",
    "we're all gonna make it brah",
    "op can't into basic computer usage",
    "it's ogre",
    "the industrial revolution and its consequences...",
    "anon delivers once again",
    "rare pepe do not steal",
    "dubs and i do it",
    "pic unrelated but here's a cat"
];

// function to get a random quote
function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * MOTD_QUOTES.length);
    return MOTD_QUOTES[randomIndex];
}

// function to display MOTD
function displayMOTD() {
    const motdElement = document.getElementById('motd');
    if (motdElement) {
        motdElement.textContent = getRandomQuote();
    }
}

// export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MOTD_QUOTES, getRandomQuote, displayMOTD };
}
