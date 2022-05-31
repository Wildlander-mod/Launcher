interface AdditionalInstructionBase {
  type: "enb";
  target: string;
}

interface DisablePluginInstruction extends AdditionalInstructionBase {
  action: "disable-plugin";
  plugin: string;
}

interface DisableModInstruction extends AdditionalInstructionBase {
  action: "disable-mod";
  mod: string;
}

export type AdditionalInstruction =
  | DisableModInstruction
  | DisablePluginInstruction;

export type AdditionalInstructions = AdditionalInstruction[];
