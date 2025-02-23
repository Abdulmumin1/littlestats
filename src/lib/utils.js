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

export function formatDate(dateString) {
	
		const date = new Date(dateString);
		
		let d = date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short', // Use 'short' for "Jan" instead of "January"
			day: '2-digit'
		});
		if (d == 'Invalid Date') return dateString
		return d;
	
}


export function executeInWorker(func, ...args) {
    return new Promise((resolve, reject) => {
        const blob = new Blob([
            `onmessage = function(e) {
                const [funcStr, args] = e.data;
                const func = new Function('return ' + funcStr)();
                postMessage(func(...args));
            }`
        ], { type: 'application/javascript' });
        
        const worker = new Worker(URL.createObjectURL(blob));
        worker.onmessage = (e) => {
            resolve(e.data);
            worker.terminate();
        };
        worker.onerror = (e) => {
            reject(e.message);
            worker.terminate();
        };
		// console.log(func.toString())
        
        worker.postMessage([func.toString(), args]);
    });
}
