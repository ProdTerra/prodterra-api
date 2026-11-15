const confirmFlag = '--confirm';

export function isCleanConfirmed(commandArguments: string[]): boolean {
  return commandArguments.includes(confirmFlag);
}
