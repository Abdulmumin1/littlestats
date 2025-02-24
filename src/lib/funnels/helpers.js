export function calculateFunnel(data, funnelSteps, type='user') {
    // 1. Group events by user_id and sort chronologically
    function calculateFunnelBySession(data, funnelSteps) {
        // 1. Group events by session
        const sessions = {};
        data.forEach((event) => {
            if (!sessions[event.session_id]) {
                sessions[event.session_id] = [];
            }
            sessions[event.session_id].push(event);
        });
    
        // 2. Process each session's events in chronological order
        const sessionProgress = {};
    
        Object.entries(sessions).forEach(([sessionId, events]) => {
            // Sort events by timestamp
            events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
            let currentStep = 0; // Track which step the user is trying to complete next
    
            // 3. Check events against funnel steps in order
            events.forEach((event) => {
                if (currentStep >= funnelSteps.length) return; // Funnel completed
    
                const targetStep = funnelSteps[currentStep];
                const isMatch =
                    (targetStep.type === 'url' && event.url === targetStep.value) ||
                    (targetStep.type === 'event' && event.event_name === targetStep.value);
    
                if (isMatch) {
                    currentStep++; // Move to next step in funnel
                }
            });
    
            // Store the highest completed step index
            sessionProgress[sessionId] = currentStep - 1;
        });
    
        // 4. Calculate counts for each step
        const funnelResults = {};
        funnelSteps.forEach((step, index) => {
            funnelResults[step.value] = Object.values(sessionProgress).filter(
                (completedStep) => completedStep >= index
            ).length;
        });
    
        return funnelResults;
    }

    if (type !== 'user') return calculateFunnelBySession(data, funnelSteps);
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

            const matchPreviousStep = currentStep == 0 ? true : funnelSteps[currentStep-1].value === stepsCompleted[currentStep-1]

            if (isMatch && matchPreviousStep) {
                stepsCompleted.push(targetStep.value);
                currentStep++;
            }
        });
        // console.log(stepsCompleted, funnelSteps)
        
        userMaxSteps[userId] = stepsCompleted;
    });

    // 3. Calculate funnel counts
    const funnelResults = {};
	// console.log(userJourneys)
    funnelSteps.forEach((step, index) => {
        funnelResults[step.value] = Object.values(userMaxSteps)
            .filter(steps => steps.includes(step.value))
            .length;
    });
    // console.log(funnelResults)
    return funnelResults;
}




export function bucketEventsByName(events) {
	events = events.filter((e) => e.event_type == 'customEvent');
    
    let ex =  events.reduce((buckets, event) => {
        // Use the event_name as the bucket key.
        if (!buckets[event.event_name]) {
            buckets[event.event_name] = [];
        }
        buckets[event.event_name].push(event);
        return buckets;
    }, {});

    return Object.keys(ex)
}

export  let calctypeoptions = [
    { value: 'user', label: 'Entire Journey' },
    { value: 'session', label: 'Session Based' },
]