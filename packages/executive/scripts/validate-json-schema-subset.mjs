const SUPPORTED_KEYWORDS = new Set([
  "$schema", "$id", "title", "$defs", "$ref", "type", "const", "enum", "pattern",
  "minLength", "required", "additionalProperties", "properties", "items", "minItems",
  "maxItems", "uniqueItems",
]);
const TYPE_NAMES = new Set(["object", "array", "string", "number", "integer", "boolean", "null"]);
const PRIMITIVE_TYPES = new Set(["string", "number", "integer", "boolean", "null"]);
const REF_METADATA = new Set(["$ref", "$schema", "$id", "title"]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}
function isScalar(value) { return value === null || ["string", "number", "boolean"].includes(typeof value); }
function same(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
function childPath(base, key) { return base === "$" ? `$.${key}` : `${base}.${key}`; }
function finding(findings, path, keyword, message) { findings.push({ path, keyword, message }); }
function requireShape(condition, findings, path, keyword, message) { if (!condition) finding(findings, path, keyword, message); }

function validateMetadataShapes(node, path, findings) {
  ["$schema", "$id", "title"].filter((key) => Object.hasOwn(node, key)).forEach((key) => requireShape(typeof node[key] === "string", findings, childPath(path, key), key, "must be a string"));
}

function validateTypeShape(node, path, findings) {
  requireShape(node.type === undefined || typeof node.type === "string" && TYPE_NAMES.has(node.type), findings, childPath(path, "type"), "type", "must be one supported scalar type name");
}
function validateConstShape(node, path, findings) {
  requireShape(!Object.hasOwn(node, "const") || isScalar(node.const), findings, childPath(path, "const"), "const", "must be a JSON scalar");
}
function validatePatternValueShape(node, path, findings) {
  requireShape(node.pattern === undefined || typeof node.pattern === "string", findings, childPath(path, "pattern"), "pattern", "must be a string");
}
function validateAdditionalPropertiesShape(node, path, findings) {
  requireShape(node.additionalProperties === undefined || typeof node.additionalProperties === "boolean", findings, childPath(path, "additionalProperties"), "additionalProperties", "must be boolean; schema-valued additionalProperties is unsupported");
}
function validateUniqueItemsShape(node, path, findings) {
  requireShape(node.uniqueItems === undefined || typeof node.uniqueItems === "boolean", findings, childPath(path, "uniqueItems"), "uniqueItems", "must be boolean");
}
function validateNonnegativeIntegerShape(node, key, path, findings) {
  if (node[key] === undefined) return;
  const valid = Number.isInteger(node[key]) ? node[key] >= 0 : false;
  requireShape(valid, findings, childPath(path, key), key, "must be a nonnegative integer");
}

function validatePatternShape(node, path, findings) {
  if (typeof node.pattern !== "string") return;
  try { new RegExp(node.pattern, "u"); } catch { finding(findings, childPath(path, "pattern"), "pattern", "must be a valid regular expression"); }
}

function validateRequiredShape(node, path, findings) {
  if (node.required === undefined) return;
  const valid = Array.isArray(node.required) && node.required.every((key) => typeof key === "string");
  requireShape(valid, findings, childPath(path, "required"), "required", "must be an array of strings");
  if (valid) requireShape(new Set(node.required).size === node.required.length, findings, childPath(path, "required"), "required", "must contain unique strings");
}

function validateEnumShape(node, path, findings) {
  if (node.enum === undefined) return;
  const values = Array.isArray(node.enum) ? node.enum : [];
  const valid = [values === node.enum, values.length > 0, values.every(isScalar)].every(Boolean);
  requireShape(valid, findings, childPath(path, "enum"), "enum", "must be a nonempty array of JSON scalars");
  if (valid) requireShape(new Set(node.enum.map(JSON.stringify)).size === node.enum.length, findings, childPath(path, "enum"), "enum", "must contain unique values");
}

function validateArrayBoundsRelation(node, path, findings) {
  const bounds = [node.minItems, node.maxItems];
  if (bounds.every(Number.isInteger)) requireShape(bounds[0] <= bounds[1], findings, path, "minItems/maxItems", "minItems must not exceed maxItems");
}
function validateUniqueItemSemantics(node, path, findings) {
  if (node.uniqueItems === true) requireShape(isPlainObject(node.items) && PRIMITIVE_TYPES.has(node.items.type), findings, childPath(path, "uniqueItems"), "uniqueItems", "requires primitive typed items in this bounded evaluator");
}

function validateRefShape(root, node, path, findings) {
  if (node.$ref === undefined) return;
  requireShape(typeof node.$ref === "string", findings, childPath(path, "$ref"), "$ref", "must be a string");
  const supported = typeof node.$ref === "string" && node.$ref.startsWith("#/$defs/") && Object.hasOwn(Object(root.$defs), node.$ref.slice(8));
  requireShape(supported, findings, childPath(path, "$ref"), "$ref", "must resolve to an existing local $defs entry");
  const siblings = Object.keys(node).filter((key) => !REF_METADATA.has(key));
  requireShape(siblings.length === 0, findings, path, "$ref", `constraint siblings are unsupported: ${siblings.join(", ")}`);
}

function inspectChildMap(root, map, path, keyword, findings) {
  if (map === undefined) return;
  requireShape(isPlainObject(map), findings, path, keyword, "must be a plain object map of schema nodes");
  if (!isPlainObject(map)) return;
  Object.entries(map).forEach(([key, child]) => inspectNode(root, child, childPath(path, key), findings));
}

function inspectItems(root, items, path, findings) {
  if (items === undefined) return;
  requireShape(isPlainObject(items), findings, path, "items", "must be a schema object");
  if (isPlainObject(items)) inspectNode(root, items, path, findings);
}

function inspectNode(root, node, path, findings) {
  requireShape(isPlainObject(node), findings, path, "schema", "schema node must be a plain object");
  if (!isPlainObject(node)) return;
  Object.keys(node).filter((key) => !SUPPORTED_KEYWORDS.has(key)).forEach((key) => finding(findings, path, "unsupported", `unsupported schema keyword ${key}`));
  validateMetadataShapes(node, path, findings);
  validateTypeShape(node, path, findings);
  validateConstShape(node, path, findings);
  validatePatternValueShape(node, path, findings);
  validateAdditionalPropertiesShape(node, path, findings);
  validateUniqueItemsShape(node, path, findings);
  validateNonnegativeIntegerShape(node, "minLength", path, findings);
  validateNonnegativeIntegerShape(node, "minItems", path, findings);
  validateNonnegativeIntegerShape(node, "maxItems", path, findings);
  validatePatternShape(node, path, findings);
  validateRequiredShape(node, path, findings);
  validateEnumShape(node, path, findings);
  validateArrayBoundsRelation(node, path, findings);
  validateUniqueItemSemantics(node, path, findings);
  validateRefShape(root, node, path, findings);
  inspectChildMap(root, node.$defs, childPath(path, "$defs"), "$defs", findings);
  inspectChildMap(root, node.properties, childPath(path, "properties"), "properties", findings);
  inspectItems(root, node.items, childPath(path, "items"), findings);
}

function collectRefs(node, refs) {
  if (!isPlainObject(node)) return refs;
  collectNodeRef(node, refs);
  collectPropertyRefs(node, refs);
  collectItemRefs(node, refs);
  return refs;
}

function collectNodeRef(node, refs) {
  if (typeof node.$ref !== "string") return;
  if (node.$ref.startsWith("#/$defs/")) refs.add(node.$ref.slice(8));
}
function collectPropertyRefs(node, refs) {
  Object.values(Object(node.properties)).forEach((child) => collectRefs(child, refs));
}
function collectItemRefs(node, refs) {
  if (isPlainObject(node.items)) collectRefs(node.items, refs);
}

function pruneAcyclic(graph) {
  const removable = [...graph].filter(([, refs]) => [...refs].every((ref) => !graph.has(ref))).map(([key]) => key);
  if (removable.length === 0) return graph;
  removable.forEach((key) => graph.delete(key));
  return pruneAcyclic(graph);
}

function validateRefCycles(schema, findings) {
  if (!isPlainObject(schema)) return;
  if (!isPlainObject(schema.$defs)) return;
  const graph = new Map(Object.entries(schema.$defs).map(([key, node]) => [key, collectRefs(node, new Set())]));
  [...pruneAcyclic(graph).keys()].forEach((key) => finding(findings, `$schema.$defs.${key}`, "$ref", "cyclic local reference graph is unsupported"));
}

function resolveRef(root, ref, findings, path) {
  const target = Object(root.$defs)[ref.slice(8)];
  if (!target) finding(findings, path, "$ref", `unresolved reference ${ref}`);
  return target;
}

function matchesType(value, type) {
  const checks = {
    object: isPlainObject(value), array: Array.isArray(value), string: typeof value === "string",
    number: typeof value === "number" && Number.isFinite(value), integer: Number.isInteger(value),
    boolean: typeof value === "boolean", null: value === null,
  };
  return checks[type] === true;
}

function validateType(schema, value, path, findings) {
  if (schema.type === undefined) return;
  if (!matchesType(value, schema.type)) finding(findings, path, "type", `expected ${schema.type}`);
}
function validateConst(schema, value, path, findings) {
  if (!Object.hasOwn(schema, "const")) return;
  if (!same(value, schema.const)) finding(findings, path, "const", `expected ${JSON.stringify(schema.const)}`);
}
function validateEnum(schema, value, path, findings) {
  if (!schema.enum) return;
  if (!schema.enum.some((candidate) => same(candidate, value))) finding(findings, path, "enum", "value is not in enum");
}
function validatePattern(schema, value, path, findings) {
  if (schema.pattern === undefined || typeof value !== "string") return;
  if (!new RegExp(schema.pattern, "u").test(value)) finding(findings, path, "pattern", `value does not match ${schema.pattern}`);
}
function validateMinLength(schema, value, path, findings) {
  if (schema.minLength === undefined || typeof value !== "string") return;
  if ([...value].length < schema.minLength) finding(findings, path, "minLength", `expected at least ${schema.minLength} characters`);
}
function validateRequired(schema, value, path, findings) {
  if (!schema.required || !isPlainObject(value)) return;
  schema.required.filter((key) => !Object.hasOwn(value, key)).forEach((key) => finding(findings, childPath(path, key), "required", "required property is missing"));
}
function validateAdditionalProperties(schema, value, path, findings) {
  if (schema.additionalProperties !== false || !isPlainObject(value)) return;
  const allowed = new Set(Object.keys(schema.properties ?? {}));
  Object.keys(value).filter((key) => !allowed.has(key)).forEach((key) => finding(findings, childPath(path, key), "additionalProperties", "property is not allowed"));
}
function validateProperties(root, schema, value, path, findings, refs) {
  if (!schema.properties || !isPlainObject(value)) return;
  Object.entries(schema.properties).filter(([key]) => Object.hasOwn(value, key)).forEach(([key, child]) => validateNode(root, child, value[key], childPath(path, key), findings, refs));
}
function validateMinItems(schema, value, path, findings) {
  if (!Array.isArray(value)) return;
  if (schema.minItems !== undefined && value.length < schema.minItems) finding(findings, path, "minItems", `expected at least ${schema.minItems} items`);
}
function validateMaxItems(schema, value, path, findings) {
  if (!Array.isArray(value)) return;
  if (schema.maxItems !== undefined && value.length > schema.maxItems) finding(findings, path, "maxItems", `expected at most ${schema.maxItems} items`);
}
function validateUniqueItems(schema, value, path, findings) {
  if (schema.uniqueItems !== true || !Array.isArray(value)) return;
  const serialized = value.map((item) => JSON.stringify(item));
  if (new Set(serialized).size !== serialized.length) finding(findings, path, "uniqueItems", "array items must be unique");
}
function validateItems(root, schema, value, path, findings, refs) {
  if (!schema.items || !Array.isArray(value)) return;
  value.forEach((item, index) => validateNode(root, schema.items, item, `${path}[${index}]`, findings, refs));
}

function validateNode(root, schema, value, path, findings, refs) {
  if (schema.$ref) {
    const name = schema.$ref.slice(8);
    if (refs.has(name)) return finding(findings, path, "$ref", "cyclic reference encountered during evaluation");
    return validateNode(root, resolveRef(root, schema.$ref, findings, path), value, path, findings, new Set([...refs, name]));
  }
  validateType(schema, value, path, findings);
  validateConst(schema, value, path, findings);
  validateEnum(schema, value, path, findings);
  validatePattern(schema, value, path, findings);
  validateMinLength(schema, value, path, findings);
  validateRequired(schema, value, path, findings);
  validateAdditionalProperties(schema, value, path, findings);
  validateProperties(root, schema, value, path, findings, refs);
  validateMinItems(schema, value, path, findings);
  validateMaxItems(schema, value, path, findings);
  validateUniqueItems(schema, value, path, findings);
  validateItems(root, schema, value, path, findings, refs);
}

export function validateJsonSchemaSubset(schema, value) {
  const findings = [];
  inspectNode(schema, schema, "$schema", findings);
  validateRefCycles(schema, findings);
  if (findings.length === 0) validateNode(schema, schema, value, "$", findings, new Set());
  return findings;
}
