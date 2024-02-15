import { Form } from "react-router-dom";
import { Box, Button } from "@mui/material";
export function TodoTestActions() {
    return (
        <Box sx={{ padding: 1 }}>
            <Form action="/api/todos/benchmark/populate" method="post" navigate={false}>
                <Button variant="contained" type="submit" className="add-lots-of-items-button">
                    Add lots of items
                </Button>
            </Form>
        </Box>
    );
}
