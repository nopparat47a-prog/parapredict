import os
import zipfile

def zip_project(output_filename, source_dir):
    excludes = ['node_modules', 'venv', '__pycache__', '.git', 'dist', '.env']
    
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # modify dirs in place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in excludes]
            
            for file in files:
                if file.endswith('.zip') or file in excludes:
                    continue
                file_path = os.path.join(root, file)
                # Ensure we don't zip the zip itself
                if os.path.abspath(file_path) == os.path.abspath(output_filename):
                    continue
                
                arcname = os.path.relpath(file_path, source_dir)
                zipf.write(file_path, arcname)

if __name__ == '__main__':
    zip_project('parapredict_clean.zip', '.')
    print("Created parapredict_clean.zip successfully!")
