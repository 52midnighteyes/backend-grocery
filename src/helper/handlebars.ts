import fs from "fs/promises";
import Handlebars from "handlebars";
import path from "path";
export const compileHandlebars = async (
  source: string,
  name: string,
  data: {},
) => {
  const file = path.join(source, name);
  const readHbs = await fs.readFile(file, "utf-8");
  const templates = Handlebars.compile(readHbs);
  return templates(data);
};
