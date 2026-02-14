
import { GoogleGenAI, Chat, Type } from "@google/genai";
import type { Scenario } from '../types';
import { OwnershipType } from '../types';
import { INITIAL_WAGON_INVENTORY } from '../constants';


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Creates and initializes a new chat session with the Gemini model.
 * The session is primed with a system instruction containing all the relevant data for the scenario.
 * @param scenario - The scenario data to ground the AI model.
 * @param bots - An array of selected agentic bots to add their expertise to the prompt.
 * @returns A promise that resolves to a Chat instance.
 */
export const createChatSession = async (scenario: Scenario, bots: { name: string, description: string }[]): Promise<Chat> => {
    const { sites, routes, comparisonData, costBreakdown, costSavings, co2Savings, title, description } = scenario;
    const { btap, bcfc, others } = comparisonData;

    let botInstructions = '';
    if (bots && bots.length > 0) {
        botInstructions = `
You have the following specialist AI bots active to assist you:
${bots.map(bot => `- **${bot.name}**: ${bot.description}`).join('\n')}

Please leverage the expertise of these specialist bots when formulating your response.
`;
    }

    const sitesString = sites.map(site => 
        `- ${site.name} (${site.type}${site.subType ? ', ' + site.subType : ''}): Located at [${site.position.join(', ')}]. Info: ${site.info}`
    ).join('\n');

    const routesString = routes.map(route => {
        const from = sites.find(s => s.id === route.from)?.name || route.from;
        const to = sites.find(s => s.id === route.to)?.name || route.to;
        return `- From ${from} to ${to} via ${route.mode}${route.capacity ? ` (Capacity: ${route.capacity})` : ''}`;
    }).join('\n');

    const wagonInventoryString = INITIAL_WAGON_INVENTORY.map(wagon => {
        const location = sites.find(s => s.id === wagon.currentLocationId)?.name || wagon.currentLocationId;
        let costInfo = '';
        if (wagon.ownership === OwnershipType.OWNED) {
            costInfo = `Owned (Depreciation: ₹${wagon.costBasis.depreciation}/day, O&M: ₹${wagon.costBasis.oAndM}/trip)`;
        } else {
            costInfo = `Leased from ${wagon.leaseVendor} (Rate: ₹${wagon.costBasis.leaseRate}/${wagon.costBasis.leaseType}, Expires: ${wagon.leaseExpiry})`;
        }
        return `- ID: ${wagon.id} (${wagon.type}, ${wagon.capacity}t). Status: ${wagon.status} at ${location}. ${costInfo}. Maintenance due: ${wagon.maintenanceDueDate}.`;
    }).join('\n');

    const comparisonString = `
- **BTAP Wagon**: Cost: ₹${btap.costPerTonKm}/ton-km, Unloading: Pneumatic (fast, ${btap.turnaroundTime}), CO₂: ${btap.co2PerTon} kg/ton.
- **BCFC Wagon**: Cost: ₹${bcfc.costPerTonKm}/ton-km, Unloading: Manual (slow, ${bcfc.turnaroundTime}), CO₂: ${bcfc.co2PerTon} kg/ton.
- **Others**: Cost: ₹${others.costPerTonKm}/ton-km, Unloading: Manual (very slow, ${others.turnaroundTime}), CO₂: ${others.co2PerTon} kg/ton.
`;

    const costBreakdownString = `
- Raw Material Landed Cost: ₹${costBreakdown.rawMaterialLanded.costPerKg.toFixed(2)}/kg
- Cement Landed at Hub: ₹${costBreakdown.cementLandedAtHub.costPerKg.toFixed(2)}/kg
- Hub to RMC Dispatch: ₹${costBreakdown.hubToRmcDispatch.costPerKg.toFixed(2)}/kg
- ESG Overhead: ₹${costBreakdown.esgOverhead.costPerKg.toFixed(2)}/kg
- **Total Landed Cost (using BTAP)**: ₹${costBreakdown.totalLandedCost.costPerKg.toFixed(2)}/kg
`;

    // Domain Knowledge for better reasoning
    const domainKnowledge = `
### Domain Knowledge for Cement Supply Chain:
1. **Production Ratios (Demand Forecasting)**:
   - **Clinker Production**: Requires approx. 1.45 Tons of Limestone and energy (Coal/Petcoke) to produce 1 Ton of Clinker.
   - **Cement Production (OPC)**: ~95% Clinker + ~5% Gypsum.
   - **Cement Production (PPC)**: ~65-70% Clinker + ~25-30% Fly Ash + ~3-5% Gypsum.
   - **RMC (Ready-Mix Concrete)**: Requires Cement, Aggregates, Sand, Water, and Admixtures.
   - **Fly Ash Sources**: Typically sourced from Thermal Power Plants (e.g., NTPC plants).

2. **Logistics Modes & Vehicles**:
   - **BTAP (Bogie Tank Aluminum Pneumatic)**: Specialized leak-proof wagons for bulk powder (Cement/Fly Ash). Requires pneumatic unloading infrastructure (silos/blowers) at the destination. Highest efficiency, lowest loss, lower CO₂.
   - **BCFC (Bogie Cement Fly Ash Cement)**: Standard covered wagons. Manual or gravity unloading. Slower turnaround time, higher labor cost.
   - **Multimodal**: Combining Rail (for long haul > 400km) with Road (for last mile < 50-100km).
   - **Route Optimization**: Rail is generally cheaper and greener for bulk transport over medium-to-long distances (>400km). Road is flexible but expensive per ton-km.

3. **Source Selection Criteria**:
   - **Cost**: Freight cost (Distance * Rate) + Material Landed Cost.
   - **Quality**: Higher grade limestone (>45% CaO) reduces fuel consumption in the Kiln.
   - **Availability**: Mine capacity vs. Plant requirement.
   - **Lead Time**: Rail rakes require indenting (planning); Road is on-demand.
`;

    const analysisGuidelines = `
### Specialized Analytical Tasks:
When the user asks, perform these specific analyses using the data provided:

1. **Demand Forecasting**:
   - **Task**: Predict mineral input needs (Limestone, Fly Ash, Gypsum).
   - **Method**: Infer the target cement production volume from the Scenario Title or Description (e.g., "10,000 Ton"). If unspecified, assume 10,000 Tons.
   - **Calculation**: Apply the Domain Knowledge ratios (e.g., for 10k tons PPC: Need ~6.5k tons Clinker -> ~9.5k tons Limestone; ~3k tons Fly Ash; ~0.5k tons Gypsum).
   - **Context**: Link this to the active Cement Plant and RMC Units in the scenario.

2. **Source Selection**:
   - **Task**: Identify optimal suppliers.
   - **Method**: Look at the 'Available Sites' list. Match 'Raw Material' sites to the Cement Plant.
   - **Evaluation**: 
     - **Cost**: Estimate based on distance (coordinates) and defined Routes.
     - **Quality**: Check the 'Info' field of the site (e.g., "Major source", "High quality").
     - **Recommendation**: Suggest the best source. For Fly Ash, mention proximity to power plants (e.g., NTPC).

3. **Vehicle & Route Optimization**:
   - **Task**: Compare Transport Modes (BTAP vs BCFC vs Road).
   - **Method**: Use the "Scenario Comparison Summary" data directly.
   - **Metrics**: 
     - **Cost Efficiency**: Compare ₹${btap.costPerTonKm}/t-km vs ₹${bcfc.costPerTonKm}/t-km vs ₹${others.costPerTonKm}/t-km.
     - **Environmental**: Compare CO₂ emissions (${btap.co2PerTon} kg/t vs ${others.co2PerTon} kg/t).
     - **Operational**: Compare Turnaround Time and Unloading method (Pneumatic vs Manual).
   - **Recommendation**: strongly advise on the mode that balances Cost and ESG based on the user's priority.
`;

    const systemInstruction = `
You are CemHub, a strategic logistics and supply chain expert for the cement industry.
You have access to specific scenario data and general application knowledge.
You can also use Google Search to supplement your answers with real-world context (e.g., current fuel prices, weather in specific Indian regions, news about NTPC plants).

${botInstructions}

## Internal Data Context

### Current Scenario: ${title}
${description}

### Scenario Financials & ESG (BTAP Baseline):
${comparisonString}
**Savings with BTAP**: ₹${costSavings.toLocaleString('en-IN')} | ${co2Savings.toFixed(1)} Tons CO₂
**Cost Breakdown**: ${costBreakdownString}

### Network Topology:
**Available Sites**:
${sitesString}

**Active Routes**:
${routesString}

### Asset Availability:
${wagonInventoryString}

${domainKnowledge}

${analysisGuidelines}

## Interaction Style
- Be professional, data-driven, and concise.
- Always cite specific numbers from the scenario (e.g., "₹1.75/ton-km") to back up your recommendations.
- When forecasting, clearly state the assumptions (e.g., "Assuming a standard PPC mix...").
- If the user asks about something not in the data (e.g., "Current diesel price in Mumbai"), use the \`googleSearch\` tool to find it.
`;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            topP: 0.95,
            topK: 64,
            tools: [{googleSearch: {}}],
        },
    });
    return chat;
};

/**
 * Sends a user's message to the ongoing chat session and returns the AI's response.
 * @param chat - The active Chat instance.
 * @param userPrompt - The user's message.
 * @returns A promise that resolves to the AI's text response.
 */
export const sendMessage = async (chat: Chat, userPrompt: string): Promise<string> => {
    try {
        const response = await chat.sendMessage({ message: userPrompt });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to communicate with the Gemini API.");
    }
};

/**
 * Generates an executive summary for a given scenario.
 * @param scenario - The scenario data.
 * @returns A promise that resolves to the AI's text summary.
 */
export const generateReportSummary = async (scenario: Scenario): Promise<string> => {
    const { btap, bcfc } = scenario.comparisonData;
    const prompt = `
    Generate a concise executive summary for a logistics report based on the following data.
    The scenario is a 10,000 ton cement transport from Raipur to Kalamboli (~1100 km).

    Key Data Points:
    - BTAP Wagon Cost: ₹${btap.costPerTonKm}/ton-km
    - BCFC Wagon Cost: ₹${bcfc.costPerTonKm}/ton-km
    - Total Cost Savings with BTAP over BCFC: ₹${scenario.costSavings.toLocaleString('en-IN')}
    - Total CO₂ Savings with BTAP over BCFC: ${scenario.co2Savings.toFixed(1)} tons
    - BTAP ESG Score: ${btap.esgScore}/10
    - BCFC ESG Score: ${bcfc.esgScore}/10
    - BTAP Unloading: Pneumatic, fast (2-3 hours)
    - BCFC Unloading: Manual/Semi-auto, slow (4-6 hours)
    - Total Landed Cost per kg (using BTAP): ₹${scenario.costBreakdown.totalLandedCost.costPerKg.toFixed(2)}

    The summary should:
    1. Start with a clear recommendation (e.g., "Adopting BTAP wagons is strongly recommended...").
    2. Quantify the primary benefits (cost and CO₂ savings).
    3. Mention secondary benefits like operational efficiency (turnaround time) and ESG score.
    4. Conclude with the overall impact on the supply chain.
    Keep it professional, under 150 words.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for summary:", error);
        throw new Error("Failed to generate report summary from Gemini API.");
    }
};

export interface AnalysisResultData {
    analysisResult: { title: string; subtitle: string; summary: string; };
    costImpact: { title: string; subtitle: string; items: string[]; };
    roleImpact: { title: string; subtitle: string; items: string[]; };
    strategyAndBusinessModelImpact: { title: string; subtitle: string; items: string[]; };
    valueChainImpact: { title: string; subtitle: string; items: string[]; };
    peopleChangeImpact: { title: string; subtitle: string; items: string[]; };
    systemAndDataImpact: { title: string; subtitle: string; items: string[]; };
    teamImpact: { title: string; subtitle: string; items: string[]; };
    skillImpact: { title: string; subtitle: string; items: string[]; };
}

export const generateStrategyAnalysis = async (promptText: string): Promise<AnalysisResultData> => {
    // Schema for a single impact card
    const impactSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            items: {
                type: Type.ARRAY,
                description: 'A list of bullet points detailing the impact. If no impact, provide a single item like "No cost impact analysis available."',
                items: { type: Type.STRING }
            }
        },
        required: ['title', 'subtitle', 'items']
    };

    // Full schema for the entire analysis result
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            analysisResult: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: 'Title for the main analysis summary.' },
                    subtitle: { type: Type.STRING, description: 'Subtitle for the main analysis summary.' },
                    summary: { type: Type.STRING, description: 'A detailed paragraph summarizing the overall analysis based on the user prompt.' },
                },
                required: ['title', 'subtitle', 'summary']
            },
            costImpact: impactSchema,
            roleImpact: impactSchema,
            strategyAndBusinessModelImpact: impactSchema,
            valueChainImpact: impactSchema,
            peopleChangeImpact: impactSchema,
            systemAndDataImpact: impactSchema,
            teamImpact: impactSchema,
            skillImpact: impactSchema,
        },
        required: [
            'analysisResult', 'costImpact', 'roleImpact', 'strategyAndBusinessModelImpact',
            'valueChainImpact', 'peopleChangeImpact', 'systemAndDataImpact', 'teamImpact', 'skillImpact'
        ]
    };

    const systemInstruction = `You are an AI assistant specialized in operating model intelligence analysis.
    Based on the user's query, provide a comprehensive analysis structured as a JSON object.
    The user's query is: "${promptText}".
    
    Your response must conform to the provided JSON schema.
    - For the main 'analysisResult.summary', provide a detailed paragraph.
    - For each 'impact' section, provide a title, a subtitle, and a list of bullet points in the 'items' array.
    - If there is no specific impact for a section based on the query, the 'items' array should contain a single string like "No relevant impact identified." or "No cost impact analysis available.".
    - Each item in the 'items' array should be a concise and informative bullet point. For items with a clear label and value, format them as "Label: Value".
    
    Analyze the user's request and generate a detailed breakdown across all impact categories.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: systemInstruction,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result;

    } catch (error) {
        console.error("Error generating strategy analysis:", error);
        // Provide a structured error response that fits the expected type
        const errorResult: AnalysisResultData = {
            analysisResult: { title: "Error", subtitle: "Failed to generate analysis", summary: "An error occurred while communicating with the AI. Please check the console for details and try again." },
            costImpact: { title: "Cost Impact", subtitle: "Error", items: ["Analysis unavailable."] },
            roleImpact: { title: "Role Impact", subtitle: "Error", items: ["Analysis unavailable."] },
            strategyAndBusinessModelImpact: { title: "Strategy and Business Model Impact", subtitle: "Error", items: ["Analysis unavailable."] },
            valueChainImpact: { title: "Value Chain Impact", subtitle: "Error", items: ["Analysis unavailable."] },
            peopleChangeImpact: { title: "People Change Impact", subtitle: "Error", items: ["Analysis unavailable."] },
            systemAndDataImpact: { title: "System and Data Impact", subtitle: "Error", items: ["Analysis unavailable."] },
            teamImpact: { title: "Team Impact", subtitle: "Error", items: ["Analysis unavailable."] },
            skillImpact: { title: "Skill Impact", subtitle: "Error", items: ["Analysis unavailable."] },
        };
        return errorResult;
    }
};

export interface TableRow {
    action: string;
    impact: string;
    priority: string;
}

export interface ScenarioRecommendation {
    demandForecasting: { summary: string, tableData: TableRow[] };
    sourceSelection: { summary: string, tableData: TableRow[] };
    routeOptimization: { summary: string, tableData: TableRow[] };
}

export const generateScenarioRecommendations = async (scenarioData: any, legsData: any[]): Promise<ScenarioRecommendation> => {
    const prompt = `
    Analyze the following supply chain scenario and provide specific recommendations in a tabular structure.
    
    Scenario Title: ${scenarioData.title}
    Legs Configuration: ${JSON.stringify(legsData.map(l => ({ from: l.fromId, to: l.toId, mode: l.mode, submode: l.submode, distance: l.distance, qty: l.qty })))}

    Provide recommendations in 3 specific categories:
    1. Demand Forecasting: Predict mineral input needs (Limestone, Fly Ash, Gypsum) based on the target quantities.
    2. Source Selection: Identify optimal suppliers based on location and cost.
    3. Vehicle & Route Optimization: Compare modes and suggest improvements.

    For each category, provide a brief summary paragraph, and then a set of structured rows for a table.
    Each table row must have:
    - 'action': The specific recommendation.
    - 'impact': The quantifiable benefit (e.g., Cost savings, Time reduction, CO2 reduction).
    - 'priority': The priority level (High, Medium, Low).

    Structure the response strictly as JSON.
    `;

    const rowSchema = {
        type: Type.OBJECT,
        properties: {
            action: { type: Type.STRING, description: "Specific recommended action." },
            impact: { type: Type.STRING, description: "Quantifiable impact (e.g., 'Save ₹5L', 'Reduce CO2 by 10%')." },
            priority: { type: Type.STRING, description: "High, Medium, or Low." }
        },
        required: ['action', 'impact', 'priority']
    };

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            demandForecasting: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    tableData: { type: Type.ARRAY, items: rowSchema }
                },
                required: ['summary', 'tableData']
            },
            sourceSelection: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    tableData: { type: Type.ARRAY, items: rowSchema }
                },
                required: ['summary', 'tableData']
            },
            routeOptimization: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    tableData: { type: Type.ARRAY, items: rowSchema }
                },
                required: ['summary', 'tableData']
            }
        },
        required: ['demandForecasting', 'sourceSelection', 'routeOptimization']
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        return JSON.parse(response.text.trim()) as ScenarioRecommendation;
    } catch (error) {
        console.error("Error generating scenario recommendations:", error);
        return {
            demandForecasting: { summary: "Analysis failed.", tableData: [] },
            sourceSelection: { summary: "Analysis failed.", tableData: [] },
            routeOptimization: { summary: "Analysis failed.", tableData: [] }
        };
    }
};