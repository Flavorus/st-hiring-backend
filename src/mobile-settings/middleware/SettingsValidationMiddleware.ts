import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export const validateDto = (dtoClass: any) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dtoObject = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoObject);

    if (errors.length > 0) {
      const formattedErrors = errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
        children: error.children,
      }));

      return res.status(400).json({ message: 'Validation failed', errors: formattedErrors });
    }

    req.body = dtoObject;
    return next();
  } catch (error) {
    console.error('Unexpected error during validation: ', error);
    res.status(500).json({
      message: 'Internal server error during validation',
      error: error.message,
    });
  }
};
