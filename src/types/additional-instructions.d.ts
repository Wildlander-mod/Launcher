interface AdditionalInstructionBase {
  // The version the instruction applies to
  version?: string;
}

interface PluginOrModInstruction extends AdditionalInstructionBase {
  type: "enb" | "resolution-ratio";
  target: string;
}

// Instruction will be run when enb is changed
// The `target` is the enb that the change will be applied on
interface DisablePluginInstruction extends PluginOrModInstruction {
  action: "disable-plugin";
  plugin: string;
}

// Instruction will be run when enb is changed
// The `target` is the enb that the change will be applied on
interface EnableModInstruction extends PluginOrModInstruction {
  action: "enable-mod";
  mod: string;
}

// A single entry of `disable-ultra-widescreen` is enough for the instruction to return true
interface DisableUltraWidescreenInstruction extends AdditionalInstructionBase {
  type?: string;
  action: "disable-ultra-widescreen";
}

export type AdditionalInstruction =
  | DisablePluginInstruction
  | EnableModInstruction
  | DisableUltraWidescreenInstruction;

export type AdditionalInstructions = AdditionalInstruction[];
