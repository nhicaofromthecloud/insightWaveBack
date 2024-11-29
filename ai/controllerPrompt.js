const {
  ChatMessage,
  Conversation,
  Example,
  AbstractPrompt,
} = require("./abstractPrompt");

class ControllerPrompt extends AbstractPrompt {
  constructor() {
    super();
    this.name = "Controller Prompt";
    this.description =
      "Direct the request from the user to the correct prompt.";
    this.prompts = ALL_OTHER_PROMPTS; // This is assumed to be defined somewhere in your project
    this.examples = this.generateExamples();
  }

  generateExamples() {
    const examples = [];
    this.prompts.forEach((prompt, index) => {
      const promptExamples = [...prompt.examples];
      for (let i = 0; i < NUM_EXAMPLES; i++) {
        if (i > promptExamples.length - 1) {
          break;
        }
        const example = promptExamples[i];
        const conversation = _.cloneDeep(example.conversation); // Assuming lodash is available for deep cloning
        conversation.messages.push({
          user: "AI Assistant",
          content: `${index + 1}`,
        });
        examples.push(new Example(conversation));
      }
    });
    return examples;
  }

  async processResponse(response) {
    if (!response.choices[0].message.function_call) {
      throw new Error("Response from API was empty.");
    }
    const json = JSON.parse(
      response.choices[0].message.function_call.arguments,
    );
    const value = json.value.toString();
    return value;
  }

  getFunction() {
    return {
      name: "getRoute",
      description: "Classify the conversation into the correct prompt.",
      parameters: {
        type: "object",
        required: ["value"],
        properties: {
          value: {
            type: "integer",
            description: "The number that corresponds to the correct prompt.",
          },
        },
      },
    };
  }

  getPromptDescriptionsText() {
    return this.prompts
      .map((prompt, index) => `${index + 1}. ${prompt.description}`)
      .join("\n");
  }

  getText() {
    return `
      You are being used as a decision controller. You will take input
      from the user and decide which action to take.

      All of your responses will be a one-digit number. That number can be:
      ${this.getPromptDescriptionsText()}

      The following are examples of some conversations.
      ${this.getExampleText()}
    `;
  }
}

module.export = {
  ControllerPrompt,
};
