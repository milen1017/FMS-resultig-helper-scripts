function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function inputNumberFromQuery() {
    const eventId = getQueryParameter('eventId');
    console.log(`Retrieved eventId from URL: ${eventId}`);

    if (eventId) {
        // Attempt to find and input the value multiple times
        const intervalId = setInterval(() => {
            const inputField = document.querySelector('input[data-ng-model="eventId"]');
            if (inputField) {
                inputField.value = eventId;

                const inputEvent = new Event('input', { bubbles: true });
                inputField.dispatchEvent(inputEvent);

                const changeEvent = new Event('change', { bubbles: true });
                inputField.dispatchEvent(changeEvent);

                console.log(`Number ${eventId} has been input into the field.`);

                clearInterval(intervalId); // Stop the interval once the value is input
            } else {
                console.error("Input field not found, retrying...");
            }
        }, 500); // Retry every 500 milliseconds
    } else {
        console.error("No eventId found in the URL query parameters.");
    }
}

window.addEventListener('load', () => {
    // Wait a bit longer after the page loads before trying to input the value
    setTimeout(inputNumberFromQuery, 500); // 0.5 second delay
});
