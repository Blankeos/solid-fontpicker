import { defineConfig } from "tsup"
import * as preset from "tsup-preset-solid"

const preset_options: preset.PresetOptions = {
  // array or single object
  entries: [
    // default entry (index)
    {
      // entries with '.tsx' extension will have `solid` export condition generated
      entry: "src/index.tsx",
      // will generate a separate development entry
      dev_entry: true,
    },
  ],
  // Set to `true` to remove all `console.*` calls and `debugger` statements in prod builds
  drop_console: true,
  // Set to `true` to generate a CommonJS build alongside ESM
  // cjs: true,
}

const CI =
  process.env.CI === "true" ||
  process.env.GITHUB_ACTIONS === "true" ||
  process.env.CI === '"1"' ||
  process.env.GITHUB_ACTIONS === '"1"'

export default defineConfig((config) => {
  const watching = !!config.watch

  const parsed_options = preset.parsePresetOptions(preset_options, watching)

  if (!watching && !CI) {
    const package_fields = preset.generatePackageExports(parsed_options)

    // restructure exports to contain root export under "."
    if (package_fields.exports && !package_fields.exports["."]) {
      const rootExport: any = {}
      const additionalExports: any = {}
      for (const key in package_fields.exports) {
        if (key.startsWith("./")) {
          additionalExports[key] = package_fields.exports[key]
        } else {
          rootExport[key] = package_fields.exports[key]
        }
      }
      // preserve additional exports like "./css" and "./style"
      package_fields.exports = {
        ".": rootExport,
        ...additionalExports,
      }
    }

    // manually inject css/style exports
    if (!package_fields.exports["./css"]) {
      package_fields.exports["./css"] = "./dist/index.css"
    }
    if (!package_fields.exports["./style"]) {
      package_fields.exports["./style"] = "./dist/index.css"
    }

    console.log(`package.json: \n\n${JSON.stringify(package_fields, null, 2)}\n\n`)

    // will update ./package.json with the correct export fields
    preset.writePackageJson(package_fields)
  }

  return preset.generateTsupOptions(parsed_options)
})
