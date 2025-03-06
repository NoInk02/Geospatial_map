import sys
import pkgutil

# Get built-in (standard library) modules
built_in_modules = {module.name for module in pkgutil.iter_modules() if module.module_finder is None}

def clean_requirements(input_file="requirements.txt", output_file="requirements_clean.txt"):
    try:
        with open(input_file, "r") as f:
            lines = f.readlines()
        
        cleaned_lines = []
        
        for line in lines:
            package_name = line.split("==")[0].strip()  # Extract package name (ignoring version)
            if package_name not in built_in_modules:   # Exclude built-in modules
                cleaned_lines.append(line)

        with open(output_file, "w") as f:
            f.writelines(cleaned_lines)

        print(f"✅ Cleaned requirements saved to: {output_file}")
    
    except FileNotFoundError:
        print(f"❌ Error: {input_file} not found.")

if __name__ == "__main__":
    clean_requirements()
