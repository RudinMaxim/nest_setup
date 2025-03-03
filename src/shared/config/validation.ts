import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvironmentVariables } from './configuration';

export function validate(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config);
    const errors = validateSync(validatedConfig);

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return validatedConfig;
}
