class ChatMessage {
  constructor(user, content, timestamp = new Date()) {
    this.user = user;
    this.content = content;
    this.timestamp = timestamp;
  }
}

class Conversation {
  constructor(id = null, messages = []) {
    this.id = id;
    this.messages = messages;
  }
}

class Example {
  constructor(conversation) {
    this.conversation = conversation;
  }
}

class AbstractPrompt {
  constructor(name, description, examples = []) {
    if (new.target === AbstractPrompt) {
      throw new TypeError("Cannot instantiate abstract class.");
    }
    this.name = name;
    this.description = description;
    this.examples = examples;
  }

  getFunction() {
    throw new Error("Method 'getFunction()' must be implemented."); // API call
  }

  async processResponse(response, conversation, inputMsg) {
    throw new Error("Method 'processResponse()' must be implemented.");
  }

  getText() {
    throw new Error("Method 'getText()' must be implemented.");
  }

  getExampleText() {
    if (this.examples.length === 0) {
      return "";
    }
    return (
      `Conversation Example: ` +
      this.examples
        .map((example) => {
          const conversation = example.conversation;
          return conversation.messages
            .map((message) => {
              return `${message.user}: ${message.content}`;
            })
            .join("\n");
        })
        .join("\n\n====================================================\n\n")
    );
  }
}

module.exports = {
  ChatMessage,
  Conversation,
  Example,
  AbstractPrompt,
};
