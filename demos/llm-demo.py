from openai import AzureOpenAI

#Set up clock to measure time taken
import time
start_time = time.time()

#Get command line arguments
import sys
selectedModel = sys.argv[1]
statement1 = sys.argv[2]
statement2 = sys.argv[3]

client = AzureOpenAI(
    api_key="",
    api_version="2024-12-01-preview",  # use the API version from your Azure resource
    azure_endpoint="https://truth-or-ai.openai.azure.com/"
)

response = client.chat.completions.create(
    model=selectedModel,
    messages=[
        {
            "role": "system",
            "content": (
                "You are the engine of a game called \"2 Truths or AI\".\n"
                "Rules:\n"
                "- The user provides two true personal statements.\n"
                "- You generate exactly one believable false statement.\n"
                "- Output format: return ONLY the generated statement, with no explanations, introductions, or extra text.\n"
                "- The statement must not be offensive, contain offensive language, or derogatory terms.\n"
                "- If the user’s facts are vague, make the lie vague too, but avoid being too obvious (e.g., avoid “User likes pizza”).\n"
                "- If the user’s facts are specific, generate a similarly specific fake statement.\n"
                "- Match the user’s tone and style of writing (e.g., spelling mistakes, grammar issues, or informal English).\n"
                "- Do not repeat any statement the user has provided, your response should be on different topics.\n"
                "- Do not say things strictly tied to the user's statements (for example if the user says \"I know how to ski\" don't say \"I once competed in a ski race\" because both are about skiing).\n"
            )
        },
        {
           "role": "user", 
           #Concatenate the two statements with labels
            "content": f"Statement1: {statement1}\nStatement2: {statement2}\n"
        }]
)

# Measure time taken
end_time = time.time()

print(response.choices[0].message.content)
print(f"Time taken: {end_time - start_time} seconds")