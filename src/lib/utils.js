/** Dispatch event on click outside of node */
export function clickOutside(node) {
	const handleClick = (event) => {
		if (node && !node.contains(event.target) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent('click_outside', node));
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}

export function calculateTrialDaysLeft(activationDate) {
    // Given date (activation date)
    const givenDate = new Date(activationDate); // Replace with the activation date passed as argument

    // Get the current date
    const now = new Date();

    // Calculate the trial end date (30 days after the given date)
    const trialEnd = new Date(givenDate);
    trialEnd.setDate(givenDate.getDate() + 30); // Add 30 days to the activation date

    // Calculate the difference in milliseconds between now and the trial end date
    const timeDifference = trialEnd - now;

    // Convert milliseconds to days
    const daysLeft = timeDifference / (1000 * 60 * 60 * 24);

    // Optionally, round to the nearest whole day
    const roundedDaysLeft = Math.ceil(daysLeft); // Use Math.floor() to round down if needed

    return roundedDaysLeft;
}