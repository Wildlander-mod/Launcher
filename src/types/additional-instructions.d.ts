interface AdditionalInstructionBase {
  // The version the instruction applies to
  version?: string;
}

// Instruction will be run when enb is changed
// The `target` is the enb that the change will be applied on
interface DisablePluginInstruction extends AdditionalInstructionBase {
  type: "enb";
  action: "disable-plugin";
  target: string;
  plugin: string;
}

// A single entry of `disable-ultra-widescreen` is enough for the instruction to return true
interface DisableUltraWidescreenInstruction extends AdditionalInstructionBase {
  type?: string;
  action: "disable-ultra-widescreen";
}

export type AdditionalInstruction =
  | DisablePluginInstruction
  | DisableUltraWidescreenInstruction;

export type AdditionalInstructions = AdditionalInstruction[];
