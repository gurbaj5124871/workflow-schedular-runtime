// https://gist.github.com/Roms1383/a2d2bb61c2522e12997465beb664a40c#file-validation-pipe-ts

import * as Joi from 'joi';
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  NotImplementedException,
  Optional,
  PipeTransform,
} from '@nestjs/common';
import * as Joiful from 'joiful';
import { Constructor, getJoiSchema } from 'joiful/core';

type Mergeable = Constructor<any> | Joi.AnySchema;

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(
    @Optional() private schemas?: Mergeable[],
    @Optional() private wrapSchemaAsArray?: boolean,
  ) {}
  mergeSchemas(): Joi.AnySchema {
    return this.schemas.reduce((merged: Joi.AnySchema, current) => {
      const schema =
        current.hasOwnProperty('isJoi') && current['isJoi']
          ? (current as Joi.AnySchema)
          : getJoiSchema(current as Constructor<any>, Joi);
      return merged ? merged.concat(schema) : schema;
    }, undefined) as Joi.Schema;
  }
  validateAsSchema(value: any): any | never {
    const { error, value: transformedValue } =
      Array.isArray(value) && this.wrapSchemaAsArray
        ? Joi.array()
            .items(this.mergeSchemas())
            .validate(value, { abortEarly: false })
        : this.mergeSchemas().validate(value, { abortEarly: false });
    if (error)
      throw new BadRequestException(error.details, 'Validation failed');
    return transformedValue;
  }
  validateAsClass(value: any, metadata: ArgumentMetadata): any | never {
    const { error, value: transformedValue } = Array.isArray(value)
      ? Joiful.validateArrayAsClass(
          value,
          metadata.metatype as Constructor<any>,
          { abortEarly: false },
        )
      : Joiful.validateAsClass(value, metadata.metatype as Constructor<any>, {
          abortEarly: false,
        });
    if (error)
      throw new BadRequestException(error.details, 'Validation failed');
    return transformedValue;
  }
  transform(value: any, metadata: ArgumentMetadata) {
    let transformedValue = value;
    if (!metadata?.metatype && !this.schemas)
      throw new NotImplementedException('Missing validation schema');
    if (this.schemas) {
      transformedValue = this.validateAsSchema(value);
    } else {
      transformedValue = this.validateAsClass(value, metadata);
    }
    return transformedValue;
  }
}
