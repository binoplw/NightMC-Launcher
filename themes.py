# themes.py - Система тем оформления

class ThemeManager:
    def __init__(self):
        self.current_theme = "dark"
    
    def get_style(self, theme_name):
        if theme_name == "light":
            return """
                QMainWindow, QDialog {
                    background-color: #F5F5F5;
                }
                QLabel {
                    color: #333333;
                    font-size: 14px;
                }
                QPushButton {
                    background-color: #E0E0E0;
                    color: #333333;
                    border: 1px solid #CCCCCC;
                    border-radius: 8px;
                    padding: 10px 20px;
                }
                QPushButton:hover {
                    background-color: #D0D0D0;
                }
                QLineEdit, QComboBox, QListWidget {
                    background-color: #FFFFFF;
                    color: #333333;
                    border: 1px solid #CCCCCC;
                    border-radius: 8px;
                    padding: 8px;
                }
                QFrame#container {
                    background-color: #FFFFFF;
                    border-radius: 20px;
                }
                QProgressBar {
                    background-color: #E0E0E0;
                    border: none;
                    border-radius: 8px;
                    height: 4px;
                }
                QProgressBar::chunk {
                    background-color: #2196F3;
                    border-radius: 8px;
                }
                QSlider::groove:horizontal {
                    height: 4px;
                    background: #E0E0E0;
                    border-radius: 2px;
                }
                QSlider::handle:horizontal {
                    background: #2196F3;
                    width: 16px;
                    height: 16px;
                    margin: -6px 0;
                    border-radius: 8px;
                }
                QScrollBar:vertical {
                    background-color: #F0F0F0;
                    width: 8px;
                    border-radius: 4px;
                }
                QScrollBar::handle:vertical {
                    background-color: #CCCCCC;
                    border-radius: 4px;
                }
            """
        elif theme_name == "oled":
            return """
                QMainWindow, QDialog {
                    background-color: #000000;
                }
                QLabel {
                    color: #FFFFFF;
                    font-size: 14px;
                }
                QPushButton {
                    background-color: #1A1A1A;
                    color: #FFFFFF;
                    border: 1px solid #333333;
                    border-radius: 8px;
                    padding: 10px 20px;
                }
                QPushButton:hover {
                    background-color: #2A2A2A;
                }
                QLineEdit, QComboBox, QListWidget {
                    background-color: #111111;
                    color: #FFFFFF;
                    border: 1px solid #333333;
                    border-radius: 8px;
                    padding: 8px;
                }
                QFrame#container {
                    background-color: #000000;
                    border: 1px solid #222222;
                    border-radius: 20px;
                }
                QProgressBar {
                    background-color: #222222;
                    border: none;
                    border-radius: 8px;
                    height: 4px;
                }
                QProgressBar::chunk {
                    background-color: #00FFCC;
                    border-radius: 8px;
                }
                QSlider::groove:horizontal {
                    height: 4px;
                    background: #222222;
                    border-radius: 2px;
                }
                QSlider::handle:horizontal {
                    background: #00FFCC;
                    width: 16px;
                    height: 16px;
                    margin: -6px 0;
                    border-radius: 8px;
                }
                QScrollBar:vertical {
                    background-color: #111111;
                    width: 8px;
                    border-radius: 4px;
                }
                QScrollBar::handle:vertical {
                    background-color: #333333;
                    border-radius: 4px;
                }
            """
        else:  # dark
            return """
                QMainWindow, QDialog {
                    background-color: #1E1E1E;
                }
                QLabel {
                    color: #FFFFFF;
                    font-size: 14px;
                }
                QPushButton {
                    background-color: #2D2D2D;
                    color: #FFFFFF;
                    border: 1px solid #444444;
                    border-radius: 8px;
                    padding: 10px 20px;
                }
                QPushButton:hover {
                    background-color: #3D3D3D;
                }
                QLineEdit, QComboBox, QListWidget {
                    background-color: #2D2D2D;
                    color: #FFFFFF;
                    border: 1px solid #444444;
                    border-radius: 8px;
                    padding: 8px;
                }
                QFrame#container {
                    background-color: #2D2D2D;
                    border-radius: 20px;
                }
                QProgressBar {
                    background-color: #3D3D3D;
                    border: none;
                    border-radius: 8px;
                    height: 4px;
                }
                QProgressBar::chunk {
                    background-color: #00FFCC;
                    border-radius: 8px;
                }
                QSlider::groove:horizontal {
                    height: 4px;
                    background: #3D3D3D;
                    border-radius: 2px;
                }
                QSlider::handle:horizontal {
                    background: #00FFCC;
                    width: 16px;
                    height: 16px;
                    margin: -6px 0;
                    border-radius: 8px;
                }
                QScrollBar:vertical {
                    background-color: #2D2D2D;
                    width: 8px;
                    border-radius: 4px;
                }
                QScrollBar::handle:vertical {
                    background-color: #555555;
                    border-radius: 4px;
                }
            """