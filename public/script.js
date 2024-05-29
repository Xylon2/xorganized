document.addEventListener('DOMContentLoaded', async (event) => {
    const sliders = document.querySelectorAll('.vertical-slider');
    const toggles = document.querySelectorAll('.toggle-checkbox');
    const debounceDelay = 1000; // Delay in milliseconds

    // Fetch saved states from server
    const savedState = await fetchSavedState();

    // Load saved states
    sliders.forEach(slider => {
        const savedValue = savedState[slider.id];
        if (savedValue !== undefined) {
            slider.value = savedValue;
        }
        const debouncedSaveToServer = debounce((id, value) => {
            localStorage.setItem(id, value);
            saveToServer(id, value);
        }, debounceDelay);

        slider.addEventListener('input', () => {
            debouncedSaveToServer(slider.id, slider.value);
        });
    });

    toggles.forEach(toggle => {
        const savedValue = savedState[toggle.id];
        if (savedValue !== undefined) {
            toggle.checked = savedValue;
        }
        toggle.addEventListener('change', () => {
            localStorage.setItem(toggle.id, toggle.checked);
            saveToServer(toggle.id, toggle.checked);
        });
    });

    // Reset checkboxes at midnight
    resetTogglesAtMidnight();
});

async function fetchSavedState() {
    try {
        const response = await fetch('/state');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        return {};
    }
}

function saveToServer(id, value) {
    fetch('/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, value })
    }).then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error));
}

function resetTogglesAtMidnight() {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const timeToMidnight = midnight.getTime() - now.getTime();

    setTimeout(() => {
        const toggles = document.querySelectorAll('.toggle-checkbox');
        toggles.forEach(toggle => {
            toggle.checked = false;
            localStorage.setItem(toggle.id, false);
            saveToServer(toggle.id, false);
        });
        resetTogglesAtMidnight(); // Reset again the next day
    }, timeToMidnight);
}

// Debounce function
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}
