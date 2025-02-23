export function calculateFunnel(data, funnelSteps) {
    // 1. Group events by user_id and sort chronologically
    const userJourneys = {};

    data.forEach(event => {
        if (!userJourneys[event.user_id]) {
            userJourneys[event.user_id] = [];
        }
        userJourneys[event.user_id].push(event);
    });

    // 2. Track each user's maximum completed step sequence
    const userMaxSteps = {};
    
    Object.entries(userJourneys).forEach(([userId, events]) => {
        // Sort all user events by timestamp across sessions
        events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        let currentStep = 0;
        const stepsCompleted = [];
        
        events.forEach(event => {
            if (currentStep >= funnelSteps.length) return;
            
            const targetStep = funnelSteps[currentStep];
            const isMatch = (
                (targetStep.type === 'url' && event.url === targetStep.value) ||
                (targetStep.type === 'event' && event.event_name === targetStep.value)
            );

            if (isMatch) {
                stepsCompleted.push(currentStep);
                currentStep++;
            }
        });
        
        userMaxSteps[userId] = stepsCompleted;
    });

    // 3. Calculate funnel counts
    const funnelResults = {};
	// console.log(userJourneys)
    funnelSteps.forEach((step, index) => {
        funnelResults[step.value] = Object.values(userMaxSteps)
            .filter(steps => steps.includes(index))
            .length;
    });

    return funnelResults;
}