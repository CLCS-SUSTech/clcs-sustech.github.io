# Week 12 实验课 · CheeseBench Operant Chamber

用双杠杆斯金纳箱观察 LLM 如何根据每次按压的结果调整选择。建议用 **20–30 分钟**：先手动按杆，再跑两个对照，最后让 LLM 玩同一个任务并讨论数据。

## 开始

在本练习目录下，激活 `cogsci` Conda 环境并安装依赖。`requirements.txt` 按 [CheeseBench 官方安装说明](https://github.com/stef41/CheeseBench#quick-start) 从 PyPI 安装 `cheesebench`，课堂固定使用 `0.2.0`。

```bash
conda activate cogsci
python -m pip install -r requirements.txt
```

在 Jupyter 或 VS Code 中打开 [中文 Notebook](lab_operant_chamber_zh.ipynb)，选择 `cogsci` 的 Python 内核。英文版见 [English notebook](lab_operant_chamber.ipynb) 和 [English guide](README_en.md)。依次运行；手动按杆时重复运行按杆那一格。离线可完成手动操作、随机策略、反馈策略、曲线与 CSV。最后一段输出 `operant_results.csv`，包括每次的杆、是否发食和累计食丸数。每局结束后记录里才加上有效杆，模型看不到这一列。

## 运行 LLM

在启动 Jupyter 的同一个终端里设置课程提供的 Chat Completions 兼容接口。`LAB_BASE_URL` 写服务的 API 根地址（如服务文档中的 `…/v1`），末尾不要写 `/chat/completions`。`LAB_MODEL` 填服务提供的模型 ID；服务不需要认证时可省略 `LAB_API_KEY`。

```bash
export LAB_BASE_URL='课程提供的 API 根地址'
export LAB_MODEL='课程提供的模型 ID'
export LAB_API_KEY='你的密钥'
```

Windows PowerShell 用 `$env:LAB_BASE_URL = '…'` 的形式设置，其余类似。再启动或重启 Notebook，设置 `RUN_LLM = True`；`LLM_SEEDS = SEEDS[:1]` 可先试单局（12 次请求）。密钥只作为请求认证，不要写进 notebook。若模型没按格式返回 `L` 或 `R`，该局会报错，不会用随机动作补上。

## 原实验和课堂版

- 来源：Stéphane Bugaud（2026），[*From Water Mazes to Language Models: A Benchmark for Testing Rodent Bio-inspired Learning in LLMs*](https://arxiv.org/abs/2604.10825)，第 2 页 *Operant Chamber*；图 1 可用作装置导入。
- `operant_lab.py` 从已安装的 [CheeseBench](https://github.com/stef41/CheeseBench) 导入 `OperantChamber`，并封装为课堂练习。
- 每局两根杆、一个有效杆，关闭提示灯。使用原环境的俯视字符图和 FR1 发食规则；学生直接选左/右，封装负责转向。原环境的额外扣分不显示给被试；课堂只记录发食或没发食。
- 每局固定 12 次按压。两局分别让左、右杆有效。同一局里各策略面对同一根有效杆。随机策略与写好的反馈策略只作课堂对照；没有对啮齿动物数据做拟合。

备课时可先跑离线版本，再用课堂账号跑一局确认接口与模型输出格式。学生提交两局曲线、逐步 CSV，以及一段用具体按压记录说明模型是否改变选择的解释。
