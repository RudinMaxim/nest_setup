import { LoggerService } from './logger.service';

const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
};

jest.mock('winston', () => ({
    createLogger: jest.fn(() => mockLogger),
    format: {
        combine: jest.fn(),
        timestamp: jest.fn(),
        errors: jest.fn(),
        colorize: jest.fn(),
        printf: jest.fn(),
    },
    transports: {
        Console: jest.fn(),
        File: jest.fn(),
    },
}));

describe('LoggerService', () => {
    let loggerService: LoggerService;

    beforeEach(() => {
        loggerService = new LoggerService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should log an info message', () => {
        loggerService.log('Test message', 'TestContext');
        expect(mockLogger.info).toHaveBeenCalledWith('Test message', { context: 'TestContext' });
    });

    it('should log an error message', () => {
        loggerService.error('Error message', 'StackTrace', 'ErrorContext');
        expect(mockLogger.error).toHaveBeenCalledWith('Error message', {
            trace: 'StackTrace',
            context: 'ErrorContext',
        });
    });

    it('should log a warning message', () => {
        loggerService.warn('Warning message', 'WarningContext');
        expect(mockLogger.warn).toHaveBeenCalledWith('Warning message', {
            context: 'WarningContext',
        });
    });

    it('should log a debug message', () => {
        loggerService.debug('Debug message', 'DebugContext');
        expect(mockLogger.debug).toHaveBeenCalledWith('Debug message', { context: 'DebugContext' });
    });

    it('should log a verbose message', () => {
        loggerService.verbose('Verbose message', 'VerboseContext');
        expect(mockLogger.verbose).toHaveBeenCalledWith('Verbose message', {
            context: 'VerboseContext',
        });
    });
});
