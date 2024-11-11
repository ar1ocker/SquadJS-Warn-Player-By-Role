import BasePlugin from "./base-plugin.js";

export default class WarnPlayerByRole extends BasePlugin {
  static get description() {
    return "The plugin for warn player by his role";
  }

  static get defaultEnabled() {
    return false;
  }

  static get optionsSpecification() {
    return {
      roles: {
        required: true,
        description: "The list of squad name regex",
        default: [
          {
            regexes: ["", ""],
            messages: ["message 1", "message 2"],
          },
          {
            regexes: ["", ""],
            messages: ["message 1", "message 2"],
          },
        ],
      },
      message_frequency: {
        required: false,
        description: "The message frequency",
        default: 5,
      },
    };
  }

  constructor(server, options, connectors) {
    super(server, options, connectors);

    this.warns = this.warns.bind(this);
    this.checkRoleName = this.checkRoleName.bind(this);
  }

  async mount() {
    this.server.on("PLAYER_ROLE_CHANGE", async (data) => {
      if (data.player) {
        this.checkRoleName(data.player);
      }
    });
  }

  async checkRoleName(player) {
    for (const { regexes, messages } of this.options.roles) {
      for (const regex of regexes) {
        if (player.role.match(regex)) {
          await this.warns(player.eosID, messages, this.options.message_frequency);
        }
      }
    }
  }

  async warns(playerID, messages, frequency = 5) {
    for (const [index, message] of messages.entries()) {
      await this.server.rcon.warn(playerID, message);

      if (index != messages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, frequency * 1000));
      }
    }
  }
}
