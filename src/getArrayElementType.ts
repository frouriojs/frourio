import ts from 'typescript';

const isArrayType = (type: ts.Type): boolean => {
  if (type.symbol?.name === 'Array') return true;

  if (type.flags & ts.TypeFlags.Object) {
    const objectType = type as ts.ObjectType;

    if (objectType.objectFlags & ts.ObjectFlags.Reference) {
      const referenceType = objectType as ts.TypeReference;

      return referenceType.target.symbol.name === 'Array';
    }
  }

  return false;
};

export const getArrayElementType = (type: ts.Type): ts.Type | null => {
  if (isArrayType(type)) {
    const objectType = type as ts.ObjectType;

    if (objectType.objectFlags & ts.ObjectFlags.Reference) {
      const referenceType = objectType as ts.TypeReference;
      const typeArguments = referenceType.typeArguments;

      if (typeArguments && typeArguments.length > 0) return typeArguments[0];
    }
  }

  return null;
};
